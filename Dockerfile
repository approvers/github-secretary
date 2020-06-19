FROM hayd/alpine-deno:1.1.0

ENV DB_CACHE_PATH /app/db/cache.json
EXPOSE 1993

WORKDIR /app
COPY .env .
COPY main.ts .
COPY ./src ./src
COPY ./example ./example
RUN deno cache main.ts
RUN mkdir db

WORKDIR /app/db
RUN echo "{}" > ./cache.json && chown -R deno:deno ./
VOLUME /app/db

WORKDIR /app

USER deno

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]
