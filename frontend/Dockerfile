FROM node:16-slim

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY frontend/. .

ENV IS_BUILDING true
EXPOSE 3000

ARG ENV_FILE
COPY ${ENV_FILE} .env

RUN . ./$ENV_FILE && pnpm run build

CMD ["pnpm", "start"]
