FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
COPY frontend/package.json ./frontend/

RUN --mount=type=cache,target=/root/.cache/pnpm \
    --mount=type=cache,target=/root/.npm \
    npm install -g pnpm && pnpm install --frozen-lockfile

COPY frontend/. ./frontend/

WORKDIR /app/frontend
RUN pnpm run build

FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/
COPY frontend/package.json ./frontend/

ENV NODE_ENV=production

WORKDIR /app/frontend
RUN --mount=type=cache,target=/root/.cache/pnpm \
    --mount=type=cache,target=/root/.npm \
    npm install -g pnpm && pnpm install --frozen-lockfile --prod
COPY --from=builder /app/frontend/build/ ./build/

EXPOSE 3100
CMD ["pnpm", "start"]
