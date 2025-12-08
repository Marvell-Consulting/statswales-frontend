# This is a multi-stage Dockerfile for the StatsWales frontend application.

# This is the initial build image
# It installs the dependencies and transpiles the TypeScript code to JavaScript.
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# This is the deployable image
FROM node:24-alpine AS runner

RUN apk update && apk upgrade && apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

# install only production dependencies
RUN npm ci --omit=dev

RUN chown -R node:node /app

# copy in the built application source from the builder image
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/docs ./docs

HEALTHCHECK --interval=5m --timeout=3s \
    CMD curl --fail http://localhost:3000 || exit 1

ENV NODE_ENV=production
EXPOSE 3000

# set the user to non-root (node)
USER node

CMD [ "node", "dist/server.js"]
