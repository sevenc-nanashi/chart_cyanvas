FROM debian:bookworm-slim AS builder
RUN apt-get update && apt-get install -y curl build-essential

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y --default-toolchain stable --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /build
COPY toolchain.toml Cargo.toml Cargo.lock ./
COPY sub-image/. ./sub-image/

# required for cargo workspaces
COPY sub-temp-storage/. ./sub-temp-storage/

RUN --mount=type=cache,target=/root/.cargo/registry \
    --mount=type=cache,target=/root/.cargo/git \
    --mount=type=cache,target=/build/target \
    cargo build --release -p sub-image && \
    cp /build/target/release/sub-image /build/sub-image/entrypoint

FROM debian:bookworm-slim
WORKDIR /app

COPY --from=builder /build/sub-image/entrypoint /app/sub-image
EXPOSE 3203
ENTRYPOINT ["/app/sub-image"]
