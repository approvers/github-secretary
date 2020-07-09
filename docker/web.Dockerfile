FROM node:12.18.1-alpine

EXPOSE 3000

RUN addgroup -g 1993 -S web \
  && adduser -u 1993 -S web -G web

COPY package.json tsconfig.json yarn.lock /app/
COPY src/web/ /app/

WORKDIR /app
RUN yarn install --frozen-lockfile \
  && yarn next build \
  && chown web:web /app

USER web

ENTRYPOINT [ "yarn", "next", "start" ]
