FROM oven/bun:1-slim as BUILD

WORKDIR /work

COPY package.json bun.lockb ./
RUN bun install --save-lockfile

COPY tsconfig.json .
COPY src/ ./src
RUN bun run build:bot

# ---

FROM oven/bun:1-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

WORKDIR /app

COPY package.json bun.lockb ./
COPY --from=BUILD work/node_modules/ ./node_modules/
COPY --from=BUILD work/dist/bundle.js ./dist/bundle.js
COPY analecta/ ./analecta/

VOLUME [ "/app/.cache" ]

USER bot

ENTRYPOINT [ "bun", "run", "start:bot" ]
