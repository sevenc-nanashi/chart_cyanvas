FROM ubuntu:22.04
ARG TARGETARCH
COPY ./tmp/${TARGETARCH} /app/sub-image

WORKDIR /app

EXPOSE 3203
ENTRYPOINT ["/app/sub-image"]
