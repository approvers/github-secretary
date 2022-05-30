FROM node:16-alpine as BUILD

WORKDIR /work

COPY package.json .
RUN npm install --no-save

COPY tsconfig.json .
COPY src/ ./src
RUN npm run build:bot

# ---

FROM node:16-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

WORKDIR /app

COPY package.json .
COPY --from=BUILD work/node_modules/ ./node_modules/
COPY --from=BUILD work/dist/bundle.js ./dist/bundle.js
COPY analecta/ ./analecta/

VOLUME [ "/app/.cache" ]

USER bot

ENTRYPOINT [ "npm", "run", "start:bot" ]
