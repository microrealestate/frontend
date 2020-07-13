FROM node:12-slim AS base
RUN apt-get update && \
    apt-get install gettext-base
WORKDIR /usr/app
RUN npm set progress=false && \
    npm config set depth 0

FROM base as dependencies
COPY public public
COPY src src
COPY package.json .
COPY package-lock.json .
COPY LICENSE .
ENV PUBLIC_URL=/app
ENV REACT_APP_APP_NAME=
ENV REACT_APP_API_URL=
RUN npm ci --silent && \
    npm run build

FROM base
COPY --from=dependencies /usr/app/build dist
RUN npm install serve -g --silent
CMD envsubst '${API_URL},${APP_NAME}' < ./dist/index.html > ./dist/resolved_index.html && \
    mv ./dist/resolved_index.html ./dist/index.html && \
    serve -s dist