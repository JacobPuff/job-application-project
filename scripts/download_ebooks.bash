#!/bin/bash
declare -i count=0
declare -i i=11
# Start at 11 because file 1 is not formatted the same as the rest, the next existing file is 10, but it's a huge file, so I'm starting at 11.
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