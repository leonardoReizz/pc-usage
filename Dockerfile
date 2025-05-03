FROM node:20.12.2-alpine

WORKDIR /app

COPY package.json .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start"]