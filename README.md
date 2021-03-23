# job-application-project
This is a project I did as a job application test thing.

### How to run (Docker)
First run `/scripts/build_and_tag.bash`.

Afterwards run `/scripts/run_docker.bash`.

Then go to `localhost:9090` in your browser.

### Why I used what I did
#### Golang
Fast and simple to use. Lots of stuff for web services is already implemented.
#### React
Saving on development time is important. I could write a bunch of vanilla JS to do a bunch of DOM manipulation, but someone has made an easy to use version for me. It made a lot of the more complex stuff I wanted to do easier.
#### Axios
Axios is an easy library for making requests, and removes a lot of boilerplate I've had to write in other projects
#### Webpack
I've used it before and so learning it again would take less time.

### Features that may be less apparent
- You can link to specific pages on the table.
- You can link to specific reports.

### How to run (Dev)
Set the `BASE_APP_DIR` to the repos directory (Or change the default value in appconfig)

Run `npm install` in `/frontend`

Run `npm run dev` in `/frontend`

Run `go run server.go` in `/backend/src`

Then go to `localhost:9090` in your browser.

If you want more files, you can change `count -eq 100` to not `100` in `download_ebooks.bash`. Just make sure to run it in the `/storage/unprocessed_files` directory.