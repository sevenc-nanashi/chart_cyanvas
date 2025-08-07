# Chart Cyanvas / A sekai custom charts platform

[![Workflow: frontend](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/frontend-check.yml?label=frontend&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/frontend-check.yml)
[![Workflow: backend](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/backend-check.yml?label=backend&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/backend-check.yml)
[![Workflow: wiki](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/wiki-check.yml?label=wiki&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/wiki-check.yml)
[![Workflow: sub-audio](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-audio-check.yml?label=sub-audio&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-audio-check.yml)
[![Workflow: sub-image](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-image-check.yml?label=sub-image&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-image-check.yml)
[![Workflow: sub-chart](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-chart-check.yml?label=sub-chart&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-chart-check.yml)
[![Workflow: sub-temp-storage](https://img.shields.io/github/actions/workflow/status/sevenc-nanashi/chart_cyanvas/sub-temp-storage-check.yml?label=sub-temp-storage&logo=github&logoColor=fff)](https://github.com/sevenc-nanashi/chart_cyanvas/actions/workflows/sub-temp-storage-check.yml)
[![Discord](https://img.shields.io/discord/1060525567797112832?logo=discord&logoColor=fff&color=5865f2&label=Discord)](https://discord.gg/2NP3U3r8Rz)

Chart Cyanvas is a sekai custom charts platform.

> [!NOTE]
> This project is still in development!

## Architecture

![Architecture](./architecture.drawio.svg)

- `frontend/` - Frontend. Built with Remix and Tailwind CSS.
- `backend/` - Backend. Built with Rails.
- `wiki/` - Documentation. Built with Vitepress.
- `sub-audio/` - Audio processing. Built with Python, FastAPI and ffmpeg.
- `sub-image/` - Image processing. Built with Rust, axum and [pjsekai-background-gen-rust](https://github.com/sevenc-nanashi/pjsekai-background-gen-rust).
- `sub-chart/` - Chart file processing. Built with TypeScript, Hono, [usctool](https://github.com/sevenc-nanashi/usctool) and [sonolus-pjsekai-engine-extended](https://github.com/sevenc-nanashi/sonolus-pjsekai-engine-extended).
- `sub-temp-storage/` - Temporary storage for sub-services. Built with Rust and axum.

## Hosting

Please refer to the [hosting guide](./hosting.md) for more information.

### Configuration

Refer `config.schema.yml` for configuration.
Remember to run `rake configure` after changing the configuration.

## Development

### Requirements

- `make`
- [Ruby 3.4](https://ruby-lang.org)
  - [Bundler](https://bundler.io)
- [Python 3.12](https://python.org)
  - [uv](http://uv.astral.sh/)
- [Node.js 22](https://nodejs.org)
  - [pnpm](https://pnpm.io)
- [Rust 1.71](https://www.rust-lang.org/)
- [Docker](https://www.docker.com/)
- [`goreman` CLI](https://github.com/mattn/goreman)

### Install dependencies

```
rake install
```

### Start external server for development

```
cp ./docker-compose.dev.yml ./docker-compose.yml
docker compose up -d
```

### Start all development server

```
goreman start
```

## License

This project is licensed under the GPLv3 License.
