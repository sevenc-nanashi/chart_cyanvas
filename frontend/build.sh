#!/usr/bin/env bash

pnpm i

cp ../.env.build .env
pnpm run build
