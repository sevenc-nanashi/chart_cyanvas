FROM node:16-slim

WORKDIR /app

COPY sub-sus/package.json ./
COPY sub-sus/dist ./dist

ENV NODE_ENV production
CMD ["pnpm", "run", "start"]
