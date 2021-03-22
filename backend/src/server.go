package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"strings"
	// "sync"
	"syscall"
	"time"
	appconfig "jacob.squizzlezig.com/jobapplicationproject/appconfig"
	structs "jacob.squizzlezig.com/jobapplicationproject/structs"
)

type ApiHandler struct {
	ListOfMetaData []structs.FileMetaData
	TagMetaDataStorage structs.TagMetaData
	TagDataFile structs.TagDataFileMutex
}

func main() {
	sigs := make(chan os.Signal, 1)
	go CheckForSigs(sigs)
	httpServer := http.Server{
		Addr:              ":" + appconfig.ServerPort,
		ReadTimeout:       1 * time.Second,
		WriteTimeout:      1 * time.Second,
		IdleTimeout:       30 * time.Second,
		ReadHeaderTimeout: 1 * time.Second,
	}
	frontendServer := http.FileServer(http.Dir(appconfig.FrontendDir))
	http.Handle("/", frontendServer)

	frontendDistServer := http.FileServer(http.Dir(appconfig.FrontendDistDir))
	http.Handle("/dist/", http.StripPrefix("/dist",frontendDistServer))

	fileServer := http.FileServer(http.Dir(appconfig.StorageFilesDir))
	http.Handle("/files/", http.StripPrefix("/files",fileServer))

	fmt.Println("Generating file metadata")
	apiHandler := ApiHandler{}
	apiHandler.TagDataFile.TagDataFile = GetTagDataFile()
	apiHandler.TagMetaDataStorage = GetTagMetaDataFromFile(apiHandler.TagDataFile.TagDataFile)
	apiHandler.ListOfMetaData = GenerateTextFilesAndMetadata()
	http.HandleFunc("/api", apiHandler.HandleAPI)
	http.HandleFunc("/api/tags", apiHandler.HandleAPITags)
	fmt.Println("Running on port " + appconfig.ServerPort)
	log.Fatal(httpServer.ListenAndServe())
}

var reportError = []byte("Report must be a number >= 0")
func (apiHandler *ApiHandler) HandleAPI(writer http.ResponseWriter, request *http.Request) {
	// DEV
	fmt.Println(request.Method, request.URL)
	if request.Method == "GET" {
		if request.URL.Query()["report"] != nil {
			report := request.URL.Query().Get("report")
			numReport, err := strconv.Atoi(report)
			if err != nil {
				writer.WriteHeader(http.StatusBadRequest)
				writer.Write(reportError)
				return
			}
			if numReport < 0 {
				writer.WriteHeader(http.StatusBadRequest)
				writer.Write(reportError)
				return
			}
			
			//handle individual report
			reportPath := fmt.Sprintf("%s/%s.txt", appconfig.StorageFilesDir, report)
			fileBytes, err := GetBytesOfFile(reportPath)
			if err != nil {
				if _, ok := err.(*fs.PathError); ok {
					writer.WriteHeader(http.StatusNotFound)
					return
				}
				fmt.Println("ERROR: Something happened when reading a report from a request.", err)
				writer.WriteHeader(http.StatusInternalServerError)
				return
			}
			writer.Write(fileBytes)
			return
		} else {
			bytesMetadata, err := json.Marshal(apiHandler.ListOfMetaData)
			if err != nil {
				fmt.Println("ERROR: Couldn't marshal metadata: " + err.Error())
			}
			writer.Write(bytesMetadata)
			return
		}
	}

	if request.Method == "POST" {
		searchQuery := structs.SearchQuery{}
		buf := new(bytes.Buffer)
		buf.ReadFrom(request.Body)
		err := json.Unmarshal(buf.Bytes(), &searchQuery)
		if err != nil {
			fmt.Println("ERROR:", err.Error())
			if err.Error() == "unexpected end of JSON input" {
				writer.WriteHeader(http.StatusBadRequest)
				writer.Write([]byte("Request must have body"))
				return
			}
			if _, ok := err.(*json.UnmarshalTypeError); ok {
				writer.WriteHeader(http.StatusBadRequest)
				writer.Write([]byte("query must be a string"))
				return
			}
			if _, ok := err.(*json.SyntaxError); ok {
				writer.WriteHeader(http.StatusBadRequest)
				writer.Write([]byte(err.Error()))
			}
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		if searchQuery.Query == "" {
			writer.WriteHeader(http.StatusBadRequest)
			writer.Write([]byte("query must not be blank"))
			return
		}

		results, err := SearchFiles(searchQuery.Query, apiHandler.ListOfMetaData)
		if err != nil {
			fmt.Println(err.Error())
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		bytesResult, err := json.Marshal(results)
		if err != nil {
			fmt.Println("ERROR: "+err.Error())
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		writer.Write(bytesResult)
		return
	}
	writer.WriteHeader(http.StatusMethodNotAllowed)
	return
}

func HandleTagRequestParsing(writer http.ResponseWriter, request *http.Request) (structs.TagRequest, error){
	tag := structs.TagRequest{}
	buf := new(bytes.Buffer)
	buf.ReadFrom(request.Body)
	err := json.Unmarshal(buf.Bytes(), &tag)
	if err != nil {
		if err.Error() == "unexpected end of JSON input" {
			writer.WriteHeader(http.StatusBadRequest)
			writer.Write([]byte("Request must have body"))
			return tag, err
		}
		if _, ok := err.(*json.UnmarshalTypeError); ok {
			writer.WriteHeader(http.StatusBadRequest)
			if strings.Contains(err.Error(), "tag") {
				writer.Write([]byte("tag must be a string"))
			}
			if strings.Contains(err.Error(), "fileNum") {
				writer.Write([]byte("fileNum must be an int"))
			}
			return tag, err
		}
		if _, ok := err.(*json.SyntaxError); ok {
			writer.WriteHeader(http.StatusBadRequest)
			writer.Write([]byte(err.Error()))
		}
		writer.WriteHeader(http.StatusInternalServerError)
		return tag, err
	}
	if tag.Tag == "" {
		blankTagErr := "tag must not be blank"
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte(blankTagErr))
		return tag, fmt.Errorf("%s\n", blankTagErr)
	}
	if tag.FileNum == nil {
		blankTagErr := "Must have fileNum field"
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte(blankTagErr))
		return tag, fmt.Errorf("%s\n", blankTagErr)
	}
	if *tag.FileNum < 0 {
		lessThanZeroErr := "fileNum must be >= 0"
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte(lessThanZeroErr))
		return tag, fmt.Errorf("%s\n", lessThanZeroErr)
	}
	return tag, nil
}

func WriteTagMetaDataToStorageFile(apiHandler *ApiHandler) error {
	apiHandler.TagDataFile.Mutex.Lock()
	bytesTagsMetadata, err := json.Marshal(apiHandler.TagMetaDataStorage)
	if err != nil {
		fmt.Println("ERROR: Error marshalling tag metadata:", err.Error())
		apiHandler.TagDataFile.Mutex.Unlock()
		return err
	}

	apiHandler.TagDataFile.TagDataFile.Truncate(0)
	written, err := apiHandler.TagDataFile.TagDataFile.WriteAt(bytesTagsMetadata, 0)
	if written == 0 || err != nil {
		fmt.Println("ERROR: Error writing to tag data file:", err.Error())
		apiHandler.TagDataFile.Mutex.Unlock()
		return err
	}
	apiHandler.TagDataFile.Mutex.Unlock()
	return nil
}

func (apiHandler *ApiHandler) HandleAPITags(writer http.ResponseWriter, request *http.Request) {
	// This would normally go into a database. The database is going to be better at handling transactions.
	// DEV
	fmt.Println(request.Method, request.URL)
	if request.Method == "GET" {
		bytesTagsMetadata, err := json.Marshal(apiHandler.TagMetaDataStorage)
		if err != nil {
			fmt.Println("ERROR: Couldn't marshal tags metadata: " + err.Error())
		}
		writer.Write(bytesTagsMetadata)
		return
	}

	if request.Method == "POST" {
		tag, err := HandleTagRequestParsing(writer, request)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		// Considered an map to empty struct for this. Decided I didn't want to deal with json.
		if FindIndexOfString(tag.Tag, apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum]) == -1 {
			apiHandler.TagMetaDataStorage.TagToCountMap[tag.Tag] = apiHandler.TagMetaDataStorage.TagToCountMap[tag.Tag] + 1
			apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum] = append(apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum], tag.Tag)
		} else {
			writer.WriteHeader(http.StatusForbidden)
			writer.Write([]byte("File already has this tag"))
			return
		}
		err = WriteTagMetaDataToStorageFile(apiHandler)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		return
	}

	if request.Method == "DELETE" {
		tag, err := HandleTagRequestParsing(writer, request)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		indexOfTag := FindIndexOfString(tag.Tag, apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum])
		if indexOfTag != -1 {
			newTagCount := apiHandler.TagMetaDataStorage.TagToCountMap[tag.Tag] - 1
			if newTagCount == 0 {
				delete(apiHandler.TagMetaDataStorage.TagToCountMap, tag.Tag)
			} else {
				apiHandler.TagMetaDataStorage.TagToCountMap[tag.Tag] = newTagCount
			}

			oldFileTagsArray := apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum]
			newFileTagsArray := append(oldFileTagsArray[:indexOfTag], oldFileTagsArray[indexOfTag+1:]...)
			if len(newFileTagsArray) == 0 {
				delete(apiHandler.TagMetaDataStorage.FileToTagsMap, *tag.FileNum)
			} else {
				apiHandler.TagMetaDataStorage.FileToTagsMap[*tag.FileNum] = newFileTagsArray
			}
		} else {
			writer.WriteHeader(http.StatusForbidden)
			writer.Write([]byte("File doesn't have this tag"))
			return
		}
		err = WriteTagMetaDataToStorageFile(apiHandler)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		return
	}
	writer.WriteHeader(http.StatusMethodNotAllowed)
	return
}

func SearchFiles(query string, listOfMetaData []structs.FileMetaData) (structs.SearchResults, error) {
	// In a real app you would be using something like ElasticSearch to index your data.
	// This is also a pretty basic search, but without something like ElasticSearch
	// implementing a fully featured search would take a lot of time.
	whitespaceRegex := regexp.MustCompile(`\s+`)
	results := structs.SearchResults{Query: query, Results: []structs.FileMetaData{}}
	fileInfo, err := os.ReadDir(appconfig.StorageFilesDir);
	if err != nil {
		return results, fmt.Errorf("ERROR: Couldn't read files directory: " + err.Error())
	}

	startTime := time.Now().UTC()
	for _, file := range fileInfo {
		if !strings.HasSuffix(file.Name(), ".txt") {
			continue
		}
		containsQuery := false
		fileBytes, err := GetBytesOfFile(appconfig.StorageFilesDir+"/"+file.Name())
		if err != nil {
			return results, fmt.Errorf("ERROR: Couldn't get text of file %s: %s\n", file.Name(), err.Error())
		}
		fileText := string(fileBytes)

		newMetaData := structs.FileMetaData{}
		newMetaData.FileNum, err = strconv.Atoi(file.Name()[0:len(file.Name())-4])
		if err != nil {
			return results, fmt.Errorf("ERROR (SearchFiles): Couldn't get integer name of file %s: %s\n", file.Name(), err.Error())
		}
		
		metadataIndex := FindIndexOfFileMetadataWithFileNum(newMetaData.FileNum, listOfMetaData)
		if metadataIndex == -1 {
			return results, fmt.Errorf("ERROR: Couldn't find index of files")
		}
		existingMetaData := listOfMetaData[metadataIndex]
		newMetaData.Title = existingMetaData.Title
		newMetaData.Subtitle = existingMetaData.Subtitle
		newMetaData.Author = existingMetaData.Author
		newMetaData.Preview = existingMetaData.Preview

		if strings.Contains(string(newMetaData.FileNum), query) {
			containsQuery = true
		}
		if strings.Contains(newMetaData.Title, query) {
			containsQuery = true
		}
		if strings.Contains(newMetaData.Subtitle, query) {
			containsQuery = true
		}
		if strings.Contains(newMetaData.Author, query) {
			containsQuery = true
		}

		index := strings.Index(fileText, query)
		if index != -1 {
			// Get text surrounding first instance of search query up to 100 characters
			containsQuery = true
			start := index - 50 + len(query)/2
			end := index + 50 - len(query)/2
			tempHolder := 0
			if start < 0 {
				tempHolder = start * -1
				start = 0
			}
			if end+tempHolder >= len(fileText) {
				tempHolder = end-len(fileText)-1
				end = len(fileText)-1
			}
			if start-tempHolder >= 0 {
				start -= tempHolder
			}
			bytePreview := whitespaceRegex.ReplaceAll([]byte(fileText[start:end]), []byte(" "))
			newMetaData.Preview = strings.TrimSpace(string(bytePreview))+"..."
		}
		if containsQuery {
			results.Results = append(results.Results, newMetaData)
		}
	}
	
	fmt.Println("Query: Got", len(results.Results), "results in", time.Now().UTC().Sub(startTime))
	return results, nil
}

func GenerateTextFilesAndMetadata() []structs.FileMetaData {
	whitespaceRegex := regexp.MustCompile(`\s+`)
	fileInfo, err := os.ReadDir(appconfig.StorageUnprocessedFilesDir);
	if err != nil {
		panic("ERROR: Couldn't read storage unprocessed_files directory: " + err.Error())
	}
	listOfMetaData := []structs.FileMetaData{}
	for _, file := range fileInfo {
		// This should never happen, but just in case this is here.
		if file.IsDir() {
			continue
		}

		fileBytes, err := GetBytesOfFile(appconfig.StorageUnprocessedFilesDir+"/"+file.Name())
		if err != nil {
			panic(fmt.Sprintf("ERROR: Couldn't get text of file %s: %s\n", file.Name(), err.Error()))
		}
		fileText := string(fileBytes)
		
		splitText := strings.SplitN(fileText, "***", 2)
		metaDataSection := strings.Split(splitText[0], "\r")
		Text := strings.TrimSpace(splitText[1])
		bytePreview := whitespaceRegex.ReplaceAll([]byte(Text[0:100]), []byte(" "))
		newMetaData := structs.FileMetaData{
			Author: "Unknown",
			Preview: strings.TrimSpace(string(bytePreview))+"...",
		}
		newMetaData.FileNum, err = strconv.Atoi(file.Name()[0:len(file.Name())-4])
		if err != nil {
			panic(fmt.Sprintf("ERROR (GenerateTextFilesAndMetadata): Couldn't get integer name of file %s: %s\n", file.Name(), err.Error()))
		}

		foundTitleIndex := -1
		for i, line := range metaDataSection {
			if foundTitleIndex != -1 && foundTitleIndex+1 == i && line != "" && !strings.Contains(line, "Author") {
				newMetaData.Subtitle = strings.TrimSpace(line)
			}
			if strings.Contains(line, "Title") {
				foundTitleIndex = i
				newMetaData.Title = strings.TrimSpace(strings.ReplaceAll(line, "Title: ", ""))
			}
			if strings.Contains(line, "Author") {
				newMetaData.Author = strings.TrimSpace(strings.ReplaceAll(line, "Author: ", ""))
			}
		}

		listOfMetaData = append(listOfMetaData, newMetaData)
		os.WriteFile(appconfig.StorageFilesDir+"/"+file.Name(), []byte(Text), 0666)
	}
	return listOfMetaData
}

func GetTagDataFile() *os.File {
	tagsFile, err := os.OpenFile(appconfig.TagDataFilePath, os.O_RDWR|os.O_CREATE, 0666)
	if err != nil {
		panic("ERROR: Error reading tag data file. "+err.Error())
	}
	return tagsFile
}

func GetTagMetaDataFromFile(file *os.File) structs.TagMetaData {
	tagMetaData := structs.TagMetaData {
		FileToTagsMap: make(map[int][]string),
		TagToCountMap: make(map[string]int),
	}
	buf := bytes.NewBuffer(nil)
	io.Copy(buf, file)
	if len(buf.Bytes()) > 0 {
		err := json.Unmarshal(buf.Bytes(), &tagMetaData)
		if err != nil && err.Error() != "unexpected end of JSON input" {
			panic("ERROR: Error unmarshalling tag data file. "+err.Error())
		}
	}
	return tagMetaData
}

func GetBytesOfFile(path string) ([]byte, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return []byte{}, err
	}
	return bytes, nil
}

func CheckForSigs(sigs chan os.Signal) {
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigs
	log.Fatal(fmt.Sprintf("Received %v.",sig))
}

func FindIndexOfFileMetadataWithFileNum(fileNum int, listOfMetaData []structs.FileMetaData) int {
	for i, metadata := range listOfMetaData {
		if fileNum == metadata.FileNum {
			return i
		}
	}
	return -1
}

func FindIndexOfString(str string, strList []string) int {
	for i, str2 := range strList {
		if str == str2 {
			return i
		}
	}
	return -1
}