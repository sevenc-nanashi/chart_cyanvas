FROM python:3.9-slim-buster

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg

COPY sub-audio/pyproject.toml sub-audio/poetry.lock ./

RUN pip install poetry && poetry config virtualenvs.create false && poetry install --only main --no-root

COPY sub-audio/* .

EXPOSE 3203

CMD [ "poetry", "run", "poe", "start" ]
