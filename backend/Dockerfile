# Build stage
FROM node:20 AS build
COPY package*.json prisma ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Runtime stage
FROM node:20-slim
ENV NODE_ENV=production
COPY --from=build /node_modules ./node_modules
COPY --from=build /dist ./dist
COPY --from=build /prisma ./prisma

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]