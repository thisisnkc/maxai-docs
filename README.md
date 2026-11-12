<div align="center">

<img src="logo/light.svg" alt="MaxAI" height="48" />

# MaxAI Docs

Developer documentation for the MaxAI API.

[![Built with Mintlify](https://img.shields.io/badge/built%20with-Mintlify-0d7a68)](https://mintlify.com)
[![Node.js 22](https://img.shields.io/badge/node-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)](compose.yaml)

</div>

---

## Table of contents

- [Overview](#overview)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Writing content](#writing-content)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)

## Overview

This repository contains the source for the MaxAI documentation site. It is built with [Mintlify](https://mintlify.com) and self-hosted using Docker, with nginx as a reverse proxy.

The site covers:

- **Getting started** — introduction, quickstart, authentication, models, and limits
- **Guides** — streaming, thinking, tool calling, structured output, image input, embeddings and reranking, error handling, and common mistakes
- **API reference** — chat completions, model listing, embeddings, and rerank endpoints

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22 or later
- [Docker](https://docs.docker.com/get-docker/) with Compose (for container deployment only)

### Run locally

```bash
git clone <repository-url>
cd maxai-docs
npx mint dev
```

The site opens at [http://localhost:3000](http://localhost:3000) and reloads when you save a file.

## Project structure

```
maxai-docs/
├── api-reference/        # Endpoint reference pages
├── guides/               # Task-focused guides
├── logo/                 # Light and dark logos
├── nginx/
│   ├── default.conf      # Reverse proxy config
│   └── health.json       # Health check response body
├── scripts/
│   └── set-host.mjs      # Rewrites the API host across all pages
├── *.mdx                 # Getting started pages
├── docs.json             # Site config: theme, branding, navigation
├── host.json             # Current API host
├── style.css             # Custom styles
├── Dockerfile            # Docs service image
└── compose.yaml          # Docs + nginx stack
```

## Writing content

1. Create an `.mdx` file in the right folder.
2. Add its path (without the extension) to `navigation` in [`docs.json`](docs.json).
3. Preview it with `npx mint dev`.

Pages support Markdown plus [Mintlify components](https://mintlify.com/docs/components) such as callouts, tabs, code groups, and parameter fields.

## Configuration

### Site settings

Theme, colors, fonts, logos, and navigation tabs are set in [`docs.json`](docs.json). See the [Mintlify settings reference](https://mintlify.com/docs/settings) for all options.

### API host

Code samples and `api:` frontmatter cannot read variables, so the API host is written directly into each page. The current value is stored in [`host.json`](host.json). To change it everywhere:

```bash
node scripts/set-host.mjs api.example.com
```

Pass the hostname only, without `https://` or a path.

## Deployment

The site runs as two containers defined in [`compose.yaml`](compose.yaml):

| Service | Role | Exposed |
| --- | --- | --- |
| `docs` | Mintlify server on Node 22 Alpine, running as a non-root user | Internal only (port 3000) |
| `proxy` | nginx reverse proxy with security headers, gzip, and WebSocket support | Host port 3000 |

### Start

```bash
docker compose up -d --build
```

The site is available at [http://localhost:3000](http://localhost:3000). Content is baked into the image, so rebuild after any change.

### Health check

```bash
curl http://localhost:3000/health
```

| Response | Meaning |
| --- | --- |
| `200 {"status":"ok"}` | Docs service is reachable |
| `503 {"status":"unavailable"}` | Docs service is down or not ready |

### Hardening

Both containers:

- Drop all Linux capabilities and set `no-new-privileges`
- Have CPU and memory limits (docs: 1 CPU / 1 GB, proxy: 0.5 CPU / 128 MB)
- Rotate logs at 10 MB, keeping 3 files
- Restart automatically unless stopped

The Mintlify CLI version is pinned in the [`Dockerfile`](Dockerfile) so image builds are reproducible.

## Known limitations

- **Search is disabled.** Mintlify search requires a Mintlify-hosted site or a CLI login, so the search bar is hidden in [`style.css`](style.css).
- **Development server.** The container runs `mint dev` rather than a static build.

## Contributing

1. Create a branch from `main`.
2. Make your changes and preview them locally with `npx mint dev`.
3. Run `docker compose up --build` to confirm the container build still works.
4. Open a pull request with a short description of what changed.
