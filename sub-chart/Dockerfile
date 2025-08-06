FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
COPY sub-chart/package.json ./sub-chart/
RUN --mount=type=cache,target=/root/.cache/pnpm \
    --mount=type=cache,target=/root/.npm \
    npm install -g pnpm && pnpm install --frozen-lockfile

COPY sub-chart/. ./sub-chart/

WORKDIR /app/sub-chart
RUN pnpm run build

FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

RUN npm install -g pnpm
COPY sub-chart/package.json ./sub-chart/
COPY --from=builder /app/sub-chart/dist/ ./sub-chart/dist/

ENV NODE_ENV production
EXPOSE 3201
WORKDIR /app/sub-chart
CMD ["pnpm", "run", "start"]
