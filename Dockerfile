# Dockerfile

FROM node:20

WORKDIR /app

COPY . /app

RUN npm install

HEALTHCHECK --interval=5m --timeout=3s \
    CMD curl --fail http://localhost:3000 || exit 1

EXPOSE 3000

CMD [ "npm", "run", "start:container"]
