package appconfig

import "os"

var ServerPort = getEnvOrDefault("SERVER_PORT", "9090")
var BaseAppDir = getEnvOrDefault("BASE_APP_DIR", "/mnt/c/Users/Jacob/Desktop/Random code stuffs/For Segmed")
var FrontendDir = getEnvOrDefault("FRONTEND_DIR",BaseAppDir+"/frontend/src")
var StorageFilesDir = getEnvOrDefault("STORAGE_FILES_DIR",BaseAppDir+"/storage/files")

func getEnvOrDefault(envVar string, defaultValue string) string {
	value := os.Getenv(envVar)
	if value == "" {
		value = defaultValue
	}
	return value
}
