FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye
# Install additional OS packages if needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client
