FROM node:16-alpine

EXPOSE 3000

RUN addgroup -g 1994 -S web \
  && adduser -u 1994 -S web -G web

WORKDIR /app

COPY --chown=web:web package.json /app/
RUN npm install --no-save

COPY --chown=web:web tsconfig.json /app/
COPY --chown=web:web src/web/ /app/
RUN npx next build

USER web

ENTRYPOINT [ "npx", "next", "start" ]
