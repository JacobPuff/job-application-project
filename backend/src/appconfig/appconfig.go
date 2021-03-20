package appconfig

import "os"

var ServerPort = getEnvOrDefault("SERVER_PORT", "9090")
var BaseAppDir = getEnvOrDefault("BASE_APP_DIR", "/app")
var FrontendDir = getEnvOrDefault("FRONTEND_DIR",BaseAppDir+"/frontend/src")
var StorageDir = getEnvOrDefault("STORAGE_DIR",BaseAppDir+"/storage")
var StorageFilesDir = StorageDir+"/files"
var StorageUnprocessedFilesDir = StorageDir+"/unprocessed_files"

func getEnvOrDefault(envVar string, defaultValue string) string {
	value := os.Getenv(envVar)
	if value == "" {
		value = defaultValue
	}
	return value
}
