FROM node:16-alpine as BUILD

RUN addgroup -g 1994 -S web \
  && adduser -u 1994 -S web -G web

WORKDIR /app

COPY package.json /app/
RUN npm install --no-save

COPY tsconfig.json /app/
COPY src/web/ /app/
RUN npx next build

FROM node:16-alpine

EXPOSE 3000

WORKDIR /app

COPY --from=BUILD /app/node_modules/ .
COPY package.json .
COPY --from=BUILD /app/.next/ .

USER web

HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT [ "npx", "next", "start" ]
