#!/bin/bash
directory_path=$(cd "$(dirname "$(dirname "${BASH_SOURCE[0]}")")"; pwd -P)
cd "$directory_path"
docker run -ti -v /"$(pwd)"/storage/data_storage_files:/app/storage/data_storage_files -p 9090:9090 jobapplicationproject