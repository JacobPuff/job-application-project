package main

import (
	"net/http"
	"fmt"
	"time"
	"log"
	"strings"
	"strconv"
	"os"
	"os/signal"
	"bytes"
	"syscall"
	"io/fs"
	"encoding/json"
	"regexp"
	appconfig "jacob.squizzlezig.com/jobapplicationproject/appconfig"
	structs "jacob.squizzlezig.com/jobapplicationproject/structs"
)

type ApiHandler struct {
	listOfMetaData []structs.FileMetaData
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
	apiHandler.listOfMetaData = GenerateTextFilesAndMetadata()
	http.HandleFunc("/api", apiHandler.HandleAPI)
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
			bytesMetadata, err := json.Marshal(apiHandler.listOfMetaData)
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
		}
		if searchQuery.Query == "" {
			writer.WriteHeader(http.StatusBadRequest)
			writer.Write([]byte("query must not be blank"))
			return
		}

		results, err := SearchFiles(searchQuery.Query, apiHandler.listOfMetaData)
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
	}
}

func (apiHandler *ApiHandler) HandleAPITags(writer http.ResponseWriter, request *http.Request) {
	// This would normally go into a database. The database is going to be better at handling transactions.
	return
}

func SearchFiles(query string, listOfMetaData []structs.FileMetaData) (structs.SearchResults, error) {
	// In a real app you would be using something like ElasticSearch to index your data.
	whitespaceRegex := regexp.MustCompile(`\s+`)
	results := structs.SearchResults{Query: query, Results: []structs.FileMetaData{}}
	fileInfo, err := os.ReadDir(appconfig.StorageUnprocessedFilesDir);
	if err != nil {
		return results, fmt.Errorf("ERROR: Couldn't read files directory: " + err.Error())
	}
	for _, file := range fileInfo {
		containsQuery := false
		fileBytes, err := GetBytesOfFile(appconfig.StorageUnprocessedFilesDir+"/"+file.Name())
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