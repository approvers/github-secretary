FROM node:12.18.4-alpine as BUILD

COPY . .

RUN npm install --no-save && npm run build:bot

# ---

FROM node:12.18.4-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

COPY --from=BUILD node_modules/ /app/node_modules/
COPY --from=BUILD dist/bundle.js /app/bot.js
COPY example/ /app/example/
WORKDIR /app

RUN chown bot:bot /app \
  && mkdir -p /app/.cache
VOLUME [ "/app/.cache" ]

ENTRYPOINT [ "npm", "run", "start:bot" ]
