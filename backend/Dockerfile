FROM ruby:3.2.0-slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev

COPY backend/Gemfile backend/Gemfile.lock ./

RUN bundle config set deployment 'true' \
    && bundle config set without 'development test' \
    && bundle install

COPY backend/. .

ENV RAILS_ENV production
CMD ["bundle", "exec", "rake", "start"]
