FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY frontend/package.json frontend/pnpm-lock.yaml ./

ENV NODE_ENV=production
ENV CI=true
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY frontend/. .

EXPOSE 3100
CMD ["pnpm", "start"]
