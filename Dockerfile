# Dockerfile

FROM node:20
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json package-lock.json .
RUN npm install
COPY dist/ .
EXPOSE 3000
CMD [ "npm", "run", "start:container"]
