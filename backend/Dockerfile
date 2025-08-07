FROM ruby:3.4.4-slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev libyaml-dev curl libssl-dev libsodium-dev libjemalloc2

COPY backend/Gemfile backend/Gemfile.lock ./

RUN --mount=type=cache,target=/root/.cache/bundle \
    bundle config set deployment 'true' \
    && bundle config set with 'production' \
    && bundle config set without 'development test' \
    && bundle config set app_config .bundle \
    && bundle config set path .cache/bundle \
    && bundle install

COPY backend/. .

ENV RAILS_ENV production
ENV RUBY_YJIT_ENABLE 1
EXPOSE 3000
ENV CONSOLE_OUTPUT XTerm
ENV LD_PRELOAD=libjemalloc.so.2
CMD ["bundle", "exec", "./start.sh"]
