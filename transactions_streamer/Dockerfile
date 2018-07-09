FROM node:9-onbuild

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY index.js ./
COPY package.json ./
COPY config ./

RUN npm i --production

CMD [ "npm", "start" ]