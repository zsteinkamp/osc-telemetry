## DEV
FROM node:20 AS dev

WORKDIR /app
COPY package* .
RUN npm ci

CMD ["npm", "run", "dev"]

## BUILDER
FROM dev AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN npm run build

## PRODUCTION BUILD BELOW
FROM builder AS prod
ENV NODE_ENV=production
COPY ./dist/ ./dist/

CMD [ "npm", "run", "start" ]
