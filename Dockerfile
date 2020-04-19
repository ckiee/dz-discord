
FROM node:13-alpine
WORKDIR /usr/src/app

COPY yarn.lock ./
COPY package.json ./

RUN yarn

COPY . .

CMD [ "yarn", "start" ]