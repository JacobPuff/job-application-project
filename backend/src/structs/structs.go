package structs

type FileMetaData struct {
	FileNum int `json:"fileNum"`
	Title string `json:"title"`
	Subtitle string `json:"subtitle"`
	Author string `json:"author"`
	Preview string `json:"preview"`
}

type FileTagData struct {
	FileNum int `json:"fileNum"`
	Tags []string `json:"tags"`
}

type SearchQuery struct {
	Query string `json:"query"`
}

type SearchResults struct {
	Query string `json:"query"`
	Results []FileMetaData `json:"results"`
}