FROM node:16-slim

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./

ENV NODE_ENV=production
ENV CI=true
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY frontend/. .

CMD ["pnpm", "start"]
