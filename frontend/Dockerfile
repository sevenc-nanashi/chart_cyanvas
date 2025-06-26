FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
COPY frontend/package.json ./frontend/

ENV NODE_ENV=production
ENV CI=true
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY frontend/. ./frontend/

EXPOSE 3100
WORKDIR /app/frontend
CMD ["pnpm", "start"]
