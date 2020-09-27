FROM node:12.18.4-alpine as BUILD

COPY . .

RUN npm install --no-save && npm run build:bot

# ---

FROM node:12.18.4-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

COPY package.json /app/
COPY --from=BUILD node_modules/ /app/node_modules/
COPY --from=BUILD dist/bundle.js /app/dist/bundle.js
COPY analecta/ /app/analecta/
WORKDIR /app

RUN chown bot:bot /app
VOLUME [ "/app/.cache" ]

ENTRYPOINT [ "npm", "run", "start:bot" ]
