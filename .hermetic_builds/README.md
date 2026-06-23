# Hermetic Builds

The Konflux pipelines (`.tekton/compliance-frontend-*.yaml`) run with
`hermetic: "true"`, meaning Cachi2 pre-fetches all dependencies before the
build starts and network access is blocked during the build itself.

## Dependency sets

Two dependency sets are locked and must be kept up to date:

- **RPM packages** (`rpms.lock.yaml` managed by `make generate-rpm-lockfile`)
- **npm packages** (`package-lock.json` managed by npm)

## Regenerating the RPM lock file

Run whenever `build-tools/Dockerfile` package installs or the base image change:

### Prerequisites

- **`podman`** — used by `ubi.repo` target
- **`rpm-lockfile-prototype`** — Konflux's RPM dependency resolver:

  ```bash
  pip3 install --user git+https://github.com/konflux-ci/rpm-lockfile-prototype
  ```

### Steps

```bash
make generate-rpm-lockfile
```

This runs three steps in sequence:
1. Extracts `ubi.repo` from the base image via `podman run`
2. Regenerates `rpms.in.yaml` from the package list
3. Resolves all transitive RPM dependencies into `rpms.lock.yaml`

Commit `ubi.repo`, `rpms.in.yaml`, and `rpms.lock.yaml` together.

## Updating npm dependencies

`package-lock.json` is the source of truth for npm packages. Cachi2 reads it
to pre-fetch all packages before the hermetic build. Keep it up to date with:

```bash
npm install   # after changing package.json
```

Always commit `package-lock.json` alongside `package.json` changes.

## How the hermetic build works

1. Cachi2 reads `package-lock.json` and pre-fetches all npm packages to a
   local cache, and downloads the RPMs listed in `rpms.lock.yaml`.
2. The Docker build runs with `HERMETIC=true` and no network access.
3. `npm ci --offline` installs packages from Cachi2's local cache.
4. RPMs are installed from the pre-fetched Cachi2 cache.
