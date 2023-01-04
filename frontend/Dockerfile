FROM node:16-slim

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY frontend/. .

ENV IS_BUILDING true
EXPOSE 3000

ARG BACKEND_HOST
ENV BACKEND_HOST=$BACKEND_HOST

RUN pnpm build

CMD ["pnpm", "start"]
