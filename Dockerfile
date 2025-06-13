FROM node:20

WORKDIR /src

COPY package*.json ./

COPY  . .

RUN rm -rf node_modules
RUN npm install

CMD ["npm", "start"]

EXPOSE 5000