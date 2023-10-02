FROM ubuntu:22.04
ARG TARGETARCH
COPY /tmp/sub-image/${TARGETARCH}/sub-image /app/sub-image

WORKDIR /app
ENTRYPOINT ["/app/sub-image"]
