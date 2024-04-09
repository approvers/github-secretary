FROM oven/bun:1-alpine as BUILD

RUN addgroup -g 1994 -S web \
  && adduser -u 1994 -S web -G web

WORKDIR /app

COPY package.json bun.lockb /app/
RUN bun install --frozen-lockfile

COPY tsconfig.json /app/
COPY src/web/ /app/
RUN bunx next build

FROM oven/bun:1-slim

EXPOSE 3000

WORKDIR /app

COPY --from=BUILD /app/node_modules/ .
COPY package.json bun.lockb ./
COPY --from=BUILD /app/.next/ .

USER web

HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT [ "bunx", "next", "start" ]
