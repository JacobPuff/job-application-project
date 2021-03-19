#!/bin/bash
for i in {0..155}
do
    text=`curl -f https://www.gutenberg.org/files/${i}/${i}-0.txt`
    if [[ $? -eq 0 ]]
    then
        echo $text > "${i}.txt"
    fi
done