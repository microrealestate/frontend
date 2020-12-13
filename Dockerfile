FROM node:12-slim

RUN apt-get update 

WORKDIR /usr/app

RUN npm set progress=false && \
    npm config set depth 0

COPY public public
COPY src src
COPY .babelrc .
COPY next.config.js .
COPY package.json .
COPY package-lock.json .
COPY LICENSE .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm ci --silent && \
    npm run build

ENTRYPOINT npm start -- -p $PORT