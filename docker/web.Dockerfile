FROM node:12.18.1-alpine

EXPOSE 3000

RUN addgroup -g 1993 -S web \
  && adduser -u 1993 -S web -G web

COPY package.json tsconfig.json pnpm-lock.yaml /app/
COPY src/web/ /app/

WORKDIR /app
RUN npm install --no-save \
  && npm run build:web \
  && chown web:web /app

USER web

ENTRYPOINT [ "npm", "run", "start:web" ]
