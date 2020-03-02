FROM node:12

WORKDIR /usr/app
RUN chown -R node:node /usr/app

USER node

COPY package*.json ./
COPY next.config.js ./
COPY nodemon.json ./
COPY .env ./
RUN mkdir ./.etc


RUN npm ci

ENTRYPOINT [ "npm", "run", "dev" ]
