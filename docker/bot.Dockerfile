FROM node:24-slim as BUILD

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /work

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --save-lockfile

COPY tsconfig.json .
COPY src/ ./src
RUN pnpm run build:bot

# ---

FROM node:24-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=BUILD work/node_modules/ ./node_modules/
COPY --from=BUILD work/dist/bundle.js ./dist/bundle.js
COPY analecta/ ./analecta/

VOLUME [ "/app/.cache" ]

USER bot

ENTRYPOINT [ "pnpm", "run", "start:bot" ]
