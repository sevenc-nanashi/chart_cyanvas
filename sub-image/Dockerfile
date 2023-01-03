FROM python:3.9-slim-buster

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN pip install poetry && poetry config virtualenvs.create false && poetry install --only main --no-root

COPY . .

EXPOSE 3203

CMD [ "poetry", "run", "poe", "start" ]
