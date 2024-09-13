FROM python:slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg curl

RUN pip install uv

COPY sub-audio/pyproject.toml sub-audio/poetry.lock ./

RUN uv pip install --no-cache --system -r requirements.lock

COPY sub-audio/* .

EXPOSE 3203

CMD python main.py
