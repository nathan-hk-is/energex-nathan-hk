FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* tsconfig.json ./
COPY prisma ./prisma
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8000

CMD ["sh", "-c", "npx prisma db push && node --require ts-node/register server.ts"]