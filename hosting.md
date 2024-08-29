# Hosting

## Hosting for development

1. Copy `./config.dev.yml` to `./config.yml` and modify it.
You can use yaml language server to help you with the configuration.

2. Run `rake configure` to generate the configuration file.

3. Launch external servers

```
cp ./docker-compose.dev.yml ./docker-compose.yml
docker compose up -d
```

4. Launch all development servers

```
goreman start
```

You can access the frontend and backend at `http://localhost:3100`,
but it's strongly recommended to use tunneling services like cloudflared or ngrok.

## Hosting for production

1. Copy `./config.prod.yml` to `./config.yml` and modify it.
You can use yaml language server to help you with the configuration.

2. Run `rake configure` to generate the configuration file.

3. Copy `./docker-compose.prod.yml` to `./docker-compose.yml`, and modify it.

The default configuration points to the original image on [ghcr.io](https://ghcr.io), so
you have to modify the url to use your own image.

4. Launch all production servers.

```
docker compose up -d
```
