# Hosting

## Docker compose configurations

### `./docker-compose.dev.yml`

Docker compose configuration for development.
It includes all external services like Redis, PostgreSQL, MinIO, but does not include backend, frontend, and other sub-services.

### `./docker-compose.prod.yml`

Docker compose configuration for production.
It includes all external services like Redis, PostgreSQL, and also backend, frontend, and other sub-services, from ghcr.io.

### `./docker-compose.build.yml`

Docker compose configuration for building the images.
It includes all sub-services, but does not include external services like Redis, PostgreSQL, MinIO.

> [!WARNING]
> Do not use this configuration for production or development, as it runs on `network_mode: host`, which is not suitable for production environments.

## Hosting for development

0. **Linux environment** is strongly recommended for development. Please use WSL2 for Windows. I don't know if it works on macOS.

1. Copy `./config.dev.yml` to `./config.yml` and modify it.
   You can use yaml language server to help you with the configuration.

2. Run `rake install` to install all dependencies in the project.

3. Run `rake secret` to generate the secret key for the application, and copy it to `config.yml`.

   > [!NOTE]
   > The secret key is used for signing cookies and other sensitive data, so it should be kept secret.

4. Run `rake configure` to generate the configuration file.

5. Launch external servers:

```
cp ./docker-compose.dev.yml ./docker-compose.yml
docker compose up -d
```

6. Run `bundle exec rails db:migrate` in `backend` to run migration.

7. Launch all development servers:

```
goreman start
```

You can access the frontend and backend at `http://localhost:3100`,
but it's strongly recommended to use tunneling services like cloudflared or ngrok.

## Hosting for production

1. Copy `./config.prod.yml` to `./config.yml` and modify it.
   You can use yaml language server to help you with the configuration.

2. Run `rake secret` to generate the secret key for the application, and copy it to `config.yml`.

   > [!NOTE]
   > The secret key is used for signing cookies and other sensitive data, so it should be kept secret.

3. Run `rake configure` to generate the configuration file.

4. Copy `./docker-compose.prod.yml` to `./docker-compose.yml`, and modify it.

The default configuration points to the original image on [ghcr.io](https://ghcr.io), so
you have to modify the url to use your own image.

5. Launch all production servers.

```
docker compose up -d
```
