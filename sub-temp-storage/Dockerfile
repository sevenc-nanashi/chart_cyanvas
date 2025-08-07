FROM debian:bookworm-slim AS builder
RUN apt-get update && apt-get install -y curl build-essential

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y --default-toolchain stable --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /build
COPY toolchain.toml Cargo.toml Cargo.lock ./
COPY sub-temp-storage/. ./sub-temp-storage/

# required for cargo workspaces
COPY sub-image/. ./sub-image/

RUN --mount=type=cache,target=/root/.cargo/registry \
    --mount=type=cache,target=/root/.cargo/git \
    --mount=type=cache,target=/build/target \
    cargo build --release -p sub-temp-storage && \
    cp /build/target/release/sub-temp-storage /build/sub-temp-storage

FROM debian:bookworm-slim
WORKDIR /app

COPY --from=builder /build/sub-temp-storage /app/sub-temp-storage
EXPOSE 3203
ENTRYPOINT ["/app/sub-temp-storage"]
