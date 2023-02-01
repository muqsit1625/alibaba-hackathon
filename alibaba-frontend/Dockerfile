FROM node:slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i && npm run build:production
WORKDIR ./build
CMD npx http-server -p 8000 -a 0.0.0.0 -y