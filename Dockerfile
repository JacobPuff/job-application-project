FROM node:15.12.0-buster
WORKDIR /build
COPY ./frontend/src ./frontend/src
COPY ./frontend/package.json ./frontend/package.json
COPY ./frontend/webpack.config.js ./frontend/webpack.config.js
WORKDIR ./frontend
RUN npm install
RUN npm run build

FROM golang:1.16.2-buster
ENV SERVER_PORT=9090
ENV BASE_APP_DIR="/app"
WORKDIR /app
COPY ./LICENSE ./LICENSE
COPY ./storage ./storage
COPY ./backend ./backend
COPY --from=0 /build/frontend ./frontend
COPY --from=0 /build/frontend/dist ./frontend/dist
WORKDIR backend/src
RUN go build -o server .
EXPOSE $SERVER_PORT
CMD ["./server"]