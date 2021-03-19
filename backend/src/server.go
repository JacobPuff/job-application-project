package main

import (
	"net/http"
	"fmt"
	"time"
	"log"
	appconfig "jacob.squizzlezig.com/jobapplicationproject/appconfig"
)

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

	fmt.Println("Running on port " + appconfig.ServerPort)
	log.Fatal(httpServer.ListenAndServe())
}