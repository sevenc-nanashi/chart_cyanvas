FROM ruby:3.4.4-slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev libyaml-dev curl libssl-dev libsodium-dev

COPY backend/Gemfile backend/Gemfile.lock ./

RUN bundle config set deployment 'true' \
    && bundle config set with 'production' \
    && bundle config set without 'development test' \
    && bundle install

COPY backend/. .

ENV RAILS_ENV production
ENV RUBY_YJIT_ENABLE 1
EXPOSE 3000
ENV CONSOLE_OUTPUT XTerm
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
