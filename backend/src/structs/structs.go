package structs

type FileMetaData struct {
	FileNum int `json:"fileNum"`
	Title string `json:"title"`
	Subtitle string `json:"subtitle"`
	Author string `json:"author"`
	StartingText string `json:"startingText"`
}

type FileTagData struct {
	FileNum int `json:"fileNum"`
	Tags []string `json:"tags"`
}