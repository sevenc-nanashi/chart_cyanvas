FROM nginx:latest

# Copy the Nginx configuration File
COPY wiki/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static files
RUN mkdir -p /data/vitepress/wiki
COPY wiki/docs /tmp/vitepress
RUN apt-get update && apt-get install -y rsync
RUN rsync -av /tmp/vitepress/.vitepress/dist/. /data/vitepress/wiki/ && \
    rsync -av /tmp/vitepress/. --exclude=.vitepress/ /data/vitepress/wiki/

EXPOSE 3101
