package main

import (
	"net/http"
	"fmt"
	"time"
	"log"
	"strings"
	"strconv"
	"os"
	"encoding/json"
	"regexp"
	appconfig "jacob.squizzlezig.com/jobapplicationproject/appconfig"
	structs "jacob.squizzlezig.com/jobapplicationproject/structs"
)

type ApiHandler struct {
	listOfMetaData []structs.FileMetaData
}

func main() {
	httpServer := http.Server{
		Addr:              ":" + appconfig.ServerPort,
		ReadTimeout:       1 * time.Second,
		WriteTimeout:      1 * time.Second,
		IdleTimeout:       30 * time.Second,
		ReadHeaderTimeout: 1 * time.Second,
	}
	frontendServer := http.FileServer(http.Dir(appconfig.FrontendDir))
	http.Handle("/", frontendServer)
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
				if strings.Contains(err.Error(), "The system cannot find the file specified.") {
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
}

func GenerateTextFilesAndMetadata() []structs.FileMetaData {
	whitespaceRegex := regexp.MustCompile(`\s+`)
	fileInfo, err := os.ReadDir(appconfig.StorageUnprocessedFilesDir);
	if err != nil {
		panic("ERROR: Couldn't read storage files directory: " + err.Error())
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
		byteStartingTest := whitespaceRegex.ReplaceAll([]byte(Text[0:100]), []byte(" "))
		newMetaData := structs.FileMetaData{
			Author: "Unknown",
			Subtitle: "None",
			StartingText: strings.TrimSpace(string(byteStartingTest)+"..."),
		}
		newMetaData.FileNum, err = strconv.Atoi(file.Name()[0:len(file.Name())-4])

		foundTitleIndex := -1
		for i, line := range metaDataSection {
			if foundTitleIndex != -1 && foundTitleIndex+1 == i && line != "" {
				newMetaData.Subtitle = line
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