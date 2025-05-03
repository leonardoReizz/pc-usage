FROM node:20.12.2-alpine

WORKDIR /app

COPY package.json .

ARG DATABASE_URL
ARG INTERVAL_IN_SECONDS

ENV DATABASE_URL=$DATABASE_URL
ENV INTERVAL_IN_SECONDS=$INTERVAL_IN_SECONDS

RUN yarn install

COPY . .

RUN npx prisma generate
RUN yarn build

CMD ["yarn", "start"]