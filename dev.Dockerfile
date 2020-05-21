FROM node:12-slim

RUN apt-get update && \
    apt-get install gettext-base

WORKDIR /usr/app

COPY . .

RUN npm ci --silent

ENTRYPOINT envsubst '${API_URL},${APP_NAME}' < ./public/index.html > ./public/resolved_index.html && \
    mv ./public/resolved_index.html ./public/index.html && \
    WDS_SOCKET_PATH=/app/sockjs-node BROWSER=none CI=true npm run start