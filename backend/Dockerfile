FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run db:generate
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

# Installer curl et openssl
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]