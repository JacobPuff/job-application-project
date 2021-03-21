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
Saving on development time is important. I could write a bunch of vanilla JS to do a bunch of DOM manipulation, but someone has made an easy to use version for me.
#### Axios
Axios is an easy library for making requests, and removes a lot of boilerplate I've had to write in other projects
#### Webpack
I've used it before and so learning it again would take less time.

### Features that may be less apparent
- You can link to specific pages on the table.
- You can link to specific reports.
- Search function returns preview surrounding the query.

### What I would do given more time
- Tags. My plan was to use a file to store them, and use a docker volume to store between sessions. I would have the top 10 used tags be available for hotkeys. I would check how hard it is to do basic "was this dragged onto me" like some places do for files, and if its a pain I would use a prebuilt drag'n'drop package for it.
- Using keys to navigate between reports. A simple event listener on the report page should do the trick.
- Changing the amount of reports shown on a page. This one is simple, but was low on my priority list.
- A second paginator at the top of the table, for easy selection when reports per page is high. Just need to refactor the paginator into it's own component.
### How to run (Dev)
Set the `BASE_APP_DIR` to the repos directory (Or change the default value in appconfig)

Run `npm install` in `/frontend`

Run `npm run dev` in `/frontend`

Run `go run server.go` in `/backend/src`

Then go to `localhost:9090` in your browser.

If you want more files, you can change `count -eq 100` to not `100` in `download_ebooks.bash`. Just make sure to run it in the `/storage/unprocessed_files` directory.