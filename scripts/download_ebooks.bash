#!/bin/bash
declare -i count=0
declare -i i=0
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