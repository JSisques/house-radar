# Build context is the repository root:
#   docker build -f apps/docs/Dockerfile .
FROM node:24-alpine AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=docs...

FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/docs/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
