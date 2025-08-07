FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
COPY wiki/package.json ./wiki/

RUN --mount=type=cache,target=/root/.cache/pnpm \
    --mount=type=cache,target=/root/.npm \
    npm install -g pnpm && pnpm install --frozen-lockfile

COPY wiki/. ./wiki/

WORKDIR /app/wiki
RUN pnpm run build

FROM nginx:latest AS runner

# Copy the Nginx configuration File
COPY wiki/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static files
RUN mkdir -p /data/vitepress/wiki
COPY --from=builder /app/wiki/docs /tmp/vitepress
RUN apt-get update && apt-get install -y rsync
RUN rsync -av /tmp/vitepress/.vitepress/dist/. /data/vitepress/wiki/ && \
    rsync -av /tmp/vitepress/. --exclude=.vitepress/ /data/vitepress/wiki/

EXPOSE 3101
