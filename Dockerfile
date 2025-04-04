# Dockerfile

FROM node:22
RUN apt update && apt install build-essential

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

HEALTHCHECK --interval=5m --timeout=3s \
    CMD curl --fail http://localhost:3000 || exit 1

EXPOSE 3000

CMD [ "npm", "run", "start:container"]
