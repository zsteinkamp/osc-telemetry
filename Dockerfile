## DEV
FROM node:20 AS dev
WORKDIR /app
COPY package* .
ENV NODE_ENV=development
RUN npm ci
CMD ["npm", "run", "dev"]

## BUILDER
FROM dev AS prod
COPY . .
WORKDIR /app
ENV NODE_ENV=production
CMD [ "npm", "run", "start" ]
