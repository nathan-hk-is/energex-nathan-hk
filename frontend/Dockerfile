FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY assets ./assets
RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]