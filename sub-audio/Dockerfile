FROM python:slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg curl

ENV RYE_HOME="/opt/rye"
ENV PATH="$RYE_HOME/shims:$PATH"
RUN curl -sSf https://rye.astral.sh/get | RYE_INSTALL_OPTION="--yes" bash

COPY sub-audio/pyproject.toml sub-audio/requirements.lock

RUN rye sync --no-dev

COPY sub-audio/* .

EXPOSE 3203

CMD rye run start
