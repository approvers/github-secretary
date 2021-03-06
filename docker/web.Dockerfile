FROM node:12.18.1-alpine

EXPOSE 3000

RUN addgroup -g 1994 -S web \
  && adduser -u 1994 -S web -G web

WORKDIR /app

COPY package.json /app/
RUN npm install --no-save

COPY tsconfig.json /app/
COPY src/web/ /app/
RUN npx next build \
  && chown web:web /app

USER web

ENTRYPOINT [ "npx", "next", "start" ]
