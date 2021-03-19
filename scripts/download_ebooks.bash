for i in {0..100}
do
    `curl https://www.gutenberg.org/files/${i}/${i}-0.txt --output ${i}.txt`
done