FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS builder
WORKDIR /opt/app-root/src
COPY package*.json ./
# Vendored FEC config-utilities tarball (FEC#2363 bundleChromeShared, unreleased)
# is a file: dependency, so it must be present before npm ci resolves it.
COPY vendor/ ./vendor/
RUN npm ci
COPY . .
RUN npm run build:iop

FROM registry.access.redhat.com/ubi9/ubi-micro:latest
# foremanctl's iop_compliance_frontend role extracts assets from /srv/dist —
# keep the image layout aligned with that role (source_path: /srv/dist/.).
ARG DIST_PATH=/srv/dist
COPY --from=builder /opt/app-root/src/dist ${DIST_PATH}
