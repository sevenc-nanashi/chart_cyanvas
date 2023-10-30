FROM node:18-slim

WORKDIR /app

RUN npm install -g pnpm
COPY sub-chart/package.json ./
COPY sub-chart/dist ./dist

ENV NODE_ENV production
EXPOSE 3201
CMD ["pnpm", "run", "start"]
