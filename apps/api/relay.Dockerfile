# Outbox relay: same build as the api, different entrypoint (dist/relay.js).
# Build context is the repository root: docker build -f apps/api/relay.Dockerfile .
FROM node:24-alpine AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@house-radar/api...
RUN pnpm --filter @house-radar/api deploy --legacy --prod /out

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3002
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -q --spider http://127.0.0.1:3002/health || exit 1
CMD ["node", "dist/relay.js"]
