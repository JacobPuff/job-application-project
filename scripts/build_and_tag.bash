#!/bin/bash
# cd to directory, and avoid symlinks with pwd -P
directory_path=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd -P)
cd "$directory_path"
docker build ../ -t jobapplicationproject