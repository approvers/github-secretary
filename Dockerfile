FROM hayd/alpine-deno:1.1.0

EXPOSE 1993

WORKDIR /app

USER deno

ADD . .
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "main.ts"]
