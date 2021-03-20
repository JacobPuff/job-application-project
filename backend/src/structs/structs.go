package structs

type FileMetaData struct {
	FileNum int `json:"fileNum"`
	Title string `json:"title"`
	Subtitle string `json:"subtitle"`
	Author string `json:"author"`
	StartingText string `json:"startingText"`
}

<<<<<<< HEAD
type FileTagData struct {
=======
type FileTagData {
>>>>>>> 7d9d66a426c4e5f13f57337f38e75215703daae3
	FileNum int `json:"fileNum"`
	Tags []string `json:"tags"`
}