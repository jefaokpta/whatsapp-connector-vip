FROM node:14
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY ./package*.json .

COPY ./dist ./dist

RUN npm install

CMD [ "node", "dist/index.js" ]

## docker build --tag jefaokpta/node-whats:2.0 .
## docker run -d --name=whats-12 -p3001:3000 -e COMPANY=12 -e API_PORT=3001 --restart=on-failure -v /tmp/whatsMediaHost:/whatsMedia jefaokpta/node-whats:1.0
