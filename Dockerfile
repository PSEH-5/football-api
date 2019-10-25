FROM node:12-slim

COPY ./ /home/src/
WORKDIR /home/src/

RUN npm install
#RUN npm install pm2

#CMD pm2 start process.json
CMD node index.js
