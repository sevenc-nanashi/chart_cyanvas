FROM python:slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg curl

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY sub-audio/pyproject.toml sub-audio/uv.lock .

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

COPY sub-audio/* .

EXPOSE 3203

CMD uv run --no-sync task start
