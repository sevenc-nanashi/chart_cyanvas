# Chart Cyanvas / A sekai custom charts platform
[![Workflow: frontend](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/frontend-check.yml?label=frontend&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/frontend-check.yml) [![Workflow: backend](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/backend-check.yml?label=backend&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/backend-check.yml) [![Workflow: sub-audio](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-audio-check.yml?label=sub-audio&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-audio-check.yml) [![Workflow: sub-image](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-image-check.yml?label=sub-image&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-image-check.yml) [![Workflow: sub-sus](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-sus-check.yml?label=sub-sus&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-sus-check.yml) [![Discord](https://img.shields.io/discord/1060525567797112832?logo=discord&logoColor=fff&color=5865f2&label=Discord)](https://discord.gg/2NP3U3r8Rz)

Chart Cyanvas is a sekai custom charts platform.

> **Warning**
> This project is still in development!

## Architecture

![Architecture](./architecture.svg)

- `frontend/` - Frontend. Built with Next.js and Tailwind CSS.
- `backend/` - Backend. Built with Rails.
- `sub-audio/` - Audio processing. Built with Python, FastApi and ffmpeg.
- `sub-image/` - Image processing. Built with Python, FastAPI and Pillow.
- `sub-sus/` - SUS processing. Built with TypeScript, express, and [sonolus-pjsekai-engine-extended](https://github.com/sevenc-nanashi/sonolus-pjsekai-engine-extended).

## Hosting
1. Copy `.env.prod.example` to `.env`
2. Fill `.env`
3. `docker compose -f docker-compose.prod.yml --profile prod up -d`

## Development

### Requirements

- `make`
- [Ruby 3.2](https://ruby-lang.org)
  - [Bundler](https://bundler.io)
- [Python 3.9](https://python.org)
  - [Poetry](https://python-poetry.org/)
    - [poethepoet](https://github.com/nat-n/poethepoet) as a Poetry plugin
- [Node.js 16](https://nodejs.org)
  - [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com/)
- [`goreman` CLI](https://github.com/mattn/goreman)

### Install dependencies

```
make install
```

### Start external server for development

```
docker compose --profile dev up -d
```

### Start all development server

```
goreman start
```

## License

This project is licensed under the GPLv3 License.
