FROM python:slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg curl

RUN curl -sSf https://rye.astral.sh/get | bash

COPY sub-audio/pyproject.toml sub-audio/requirements.lock

RUN rye sync --no-dev

COPY sub-audio/* .

EXPOSE 3203

CMD python main.py
