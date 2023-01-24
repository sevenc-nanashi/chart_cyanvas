FROM node:16-slim

WORKDIR /app

COPY sub-sus/package.json sub-sus/pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --prod

COPY sub-sus/* .

ENV NODE_ENV production
CMD ["pnpm", "run", "start"]
