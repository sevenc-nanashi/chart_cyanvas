# Chart Cyanvas / A sekai custom charts platform

Chart Cyanvas is a sekai custom charts platform.

> **Warning**
> This project is still in development!

## Architecture

![Architecture](./architecture.svg)

- `frontend/` - Frontend. Built with Next.js and Tailwind CSS.
- `backend/` - Backend. Built with Rails.
- `sub-audio/` - Audio processing. Built with Python, FastApi and ffmpeg.
- `sub-image/` - Image processing. Built with Python, FastAPI and Pillow.
- `sub-sus/` - SUS processing. Built with TypeScript, express, and [sonolus-pjsekai-engine-extended](https://github.com/sevenc-nanashi/sonolus-pjsekai-engine-extended)

## License

This project is licensed under the GPLv3 License.
