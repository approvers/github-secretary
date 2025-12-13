FROM node:24-alpine as BUILD

RUN addgroup -g 1994 -S web \
  && adduser -u 1994 -S web -G web

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY src/web/ /app/
RUN pnpm dlx next build

# ---

FROM node:24-slim

EXPOSE 3000

WORKDIR /app

COPY --from=BUILD /app/node_modules/ .
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=BUILD /app/.next/ .

USER web

HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT [ "pnpm", "dlx", "next", "start" ]
