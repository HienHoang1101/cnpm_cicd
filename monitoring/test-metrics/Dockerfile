FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 9091

CMD ["node", "test-metrics-exporter.js"]
