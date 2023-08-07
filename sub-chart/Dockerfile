FROM node:16-slim

WORKDIR /app

RUN npm install -g pnpm
COPY sub-chart/package.json ./
COPY sub-chart/dist ./dist

ENV NODE_ENV production
CMD ["pnpm", "run", "start"]
