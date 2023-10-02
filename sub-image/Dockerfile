FROM ubuntu:22.04
ARG TARGETARCH
COPY ./tmp/${TARGETARCH} /app/sub-image

WORKDIR /app
ENTRYPOINT ["/app/sub-image"]
