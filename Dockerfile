FROM node:12-slim AS base

RUN apt-get update && \
    apt-get install gettext-base

WORKDIR /usr/app
RUN npm set progress=false && \
    npm config set depth 0

FROM base as dependencies
COPY . .
RUN npm ci --silent && \
    npm run build

FROM base AS release
RUN npm install serve -g --silent
COPY --from=dependencies /usr/app/build ./dist
ENTRYPOINT envsubst '${API_URL},${APP_NAME}' < ./dist/index.html > ./dist/resolved_index.html && \
    mv ./dist/resolved_index.html ./dist/index.html && \
    serve dist