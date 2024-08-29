FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

RUN npm install -g pnpm
COPY sub-chart/package.json ./
COPY sub-chart/dist ./dist

ENV NODE_ENV production
EXPOSE 3201
CMD ["pnpm", "run", "start"]
