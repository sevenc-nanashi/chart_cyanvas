# syntax=docker/dockerfile:1

FROM rust:1 AS builder

WORKDIR /app

## -- Magic for caching dependencies -------------------------------------------
COPY sub-audio/Cargo.toml .
COPY Cargo.lock .
RUN mkdir -p src && echo "fn main() {}" > dummy.rs && cp dummy.rs src/main.rs
RUN cargo build --release

## -- Actual build -------------------------------------------------------------
COPY sub-audio/src src

RUN bash -c "if cmp --silent dummy.rs src/main.rs; then echo 'dummy.rs and src/main.rs are the same!'; exit 1; fi"
RUN rm dummy.rs /app/target/release/deps/sub_audio* && cargo build --release

# ## == Runtime image ===========================================================
FROM ubuntu:20.04 AS runtime

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates ffmpeg
COPY --from=builder /app/target/release/sub-audio /app/sub-audio

EXPOSE 3202

CMD [ "/app/sub-audio" ]
