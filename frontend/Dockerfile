FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml patches ./

ENV NODE_ENV=production
ENV CI=true
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY frontend/. ./frontend/

EXPOSE 3100
WORKDIR /app/frontend
CMD ["pnpm", "start"]
