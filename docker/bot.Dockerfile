FROM node:16-alpine as BUILD

WORKDIR /work

COPY package.json .
RUN npm install --no-save

COPY tsconfig.json .
COPY src/ .
RUN npm run build:bot

# ---

FROM node:16-alpine

RUN addgroup -g 1993 -S bot \
  && adduser -u 1993 -S bot -G bot

COPY package.json /app/
COPY --from=BUILD node_modules/ /app/node_modules/
COPY --from=BUILD dist/bundle.js /app/dist/bundle.js
COPY analecta/ /app/analecta/
WORKDIR /app

VOLUME [ "/app/.cache" ]

ENTRYPOINT [ "npm", "run", "start:bot" ]
