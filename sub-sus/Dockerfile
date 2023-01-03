FROM node:16-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

ENV NODE_ENV production
CMD ["pnpm", "run", "start"]
