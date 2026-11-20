---
title: "D36. Docs hosting on Cloudflare Pages"
description: "The documentation portal is published on Cloudflare Pages at the root of its pages.dev domain, with a deployment on every merge to main and a preview per pull request."
sidebar:
  order: 37
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The documentation portal ([D11](/adr/d11-documentation-portal/)) is public. Its content contains 858 root-absolute internal links (for example `/adr/d33-versioning-and-releases/`). Hosting it under a subpath would break them: with GitHub Pages at `jsisques.github.io/house-radar/` the site would need `base: '/house-radar'`, which Starlight applies to its navigation but not to links written in the content.

## Decision

- The portal is hosted on **Cloudflare Pages** and served at the root of `<project>.pages.dev`. The project name is confirmed when the Cloudflare project is created; a custom domain can be added later without changes.
- Every merge to `main` publishes the portal, and every pull request gets a preview deployment, so documentation changes are reviewed already published.
- Once the URL exists, it is set as the Astro `site` (which removes the sitemap warning) and as the repository homepage.

## Consequences

- The 858 root-absolute links keep working without rewriting content.
- No domain has to be bought now, and one can be attached later.
- Pull requests get a published preview of documentation changes.
- Adds a dependency on a third-party hosting service and a Cloudflare project to maintain.

## Alternatives considered

- **GitHub Pages under a subpath:** the 858 root-absolute links would break. Discarded.
- **GitHub Pages with a custom domain:** requires buying a domain now. Discarded.
