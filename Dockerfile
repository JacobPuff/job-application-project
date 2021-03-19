FROM node:15.12.0-buster
WORKDIR /build
COPY ./frontend/src ./frontend/src
COPY ./frontend/package.json ./frontend/package.json
RUN npm install

FROM golang:1.15.1-buster
ENV SERVER_PORT=9090
ENV BASE_APP_DIR="/app"
WORKDIR /app
COPY ./storage ./storage
COPY ./backend ./backend
COPY --from=0 /build/frontend ./frontend
WORKDIR backend/src
RUN go build -o server .
EXPOSE $SERVER_PORT
CMD ["./server"]