package structs

import (
	"os"
	"sync"
)

type TagDataFileMutex struct {
	TagDataFile *os.File
	Mutex   sync.Mutex
}

type FileMetaData struct {
	FileNum int `json:"fileNum"`
	Title string `json:"title"`
	Subtitle string `json:"subtitle"`
	Author string `json:"author"`
	Preview string `json:"preview"`
	Tags []string `json:"tags"`
}

type TagMetaData struct {
	FileToTagsMap map[int][]string `json:"fileToTags"`
	TagToCountMap map[string]int `json:"tagCounts"`
}

type SearchQuery struct {
	Query string `json:"query"`
}

type SearchResults struct {
	Query string `json:"query"`
	Results []FileMetaData `json:"results"`
}