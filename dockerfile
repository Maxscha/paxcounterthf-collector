FROM node:12
WORKDIR /usr/src/build

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build --prod


CMD [ "node", "dist/index.js" ]