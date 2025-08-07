FROM debian:bookworm-slim AS builder
RUN apt-get update && apt-get install -y curl build-essential

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y --default-toolchain stable --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /build
COPY toolchain.toml Cargo.toml Cargo.lock ./
COPY sub-temp-storage/. ./sub-temp-storage/

# required for cargo workspaces
COPY sub-image/. ./sub-image/

# NOTE: using --mount=type=cache to cache .cargo/{git,registry} directories causes many issues with the build cache, so we copy them manually
RUN --mount=type=cache,target=/tmp/cargo_registry \
    --mount=type=cache,target=/tmp/cargo_git \
    --mount=type=cache,target=/build/target \
    cp -rp /tmp/cargo_registry /root/.cargo/registry && \
    cp -rp /tmp/cargo_git /root/.cargo/git && \
    cargo build --release -p sub-temp-storage && \
    cp -rp /root/.cargo/registry/. /tmp/cargo_registry && \
    cp -rp /root/.cargo/git/. /tmp/cargo_git && \
    cp /build/target/release/sub-temp-storage /build/sub-temp-storage/entrypoint


FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y curl

COPY --from=builder /build/sub-temp-storage/entrypoint /app/sub-temp-storage
EXPOSE 3204
ENTRYPOINT ["/app/sub-temp-storage"]
