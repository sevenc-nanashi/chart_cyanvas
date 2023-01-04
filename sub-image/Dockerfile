FROM python:3.9-slim-buster

WORKDIR /app

COPY sub-image/pyproject.toml sub-image/poetry.lock ./

RUN pip install poetry && poetry config virtualenvs.create false && poetry install --only main --no-root

COPY sub-image/* .

EXPOSE 3203

CMD [ "poetry", "run", "poe", "start" ]
