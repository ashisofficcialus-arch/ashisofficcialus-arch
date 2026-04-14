# Frontend
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

# Backend
FROM node:20-alpine AS backend

WORKDIR /app

RUN apk add --no-cache ffmpeg yt-dlp

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
