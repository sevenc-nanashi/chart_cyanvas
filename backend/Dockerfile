FROM ruby:3.2.0-slim-bullseye

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN apt-get update && apt-get install -y build-essential libpq-dev

RUN bundle config set deployment 'true' \
    && bundle config set without 'development test' \
    && bundle install

COPY . .

ENV RAILS_ENV production
CMD ["bundle", "exec", "./init.sh"]
