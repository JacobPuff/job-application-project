#!/bin/bash
declare -i count=0
declare -i i=10
# Start at ten because file 1 is not formatted the same as the rest, and I know the next existing file is 10.
until [[ count -eq 100 ]]
do
    text=`curl -f https://www.gutenberg.org/files/${i}/${i}-0.txt`
    if [[ $? -eq 0 ]]
    then
        count=count+1
        echo $text > "${i}.txt"
    fi
    i=i+1
done