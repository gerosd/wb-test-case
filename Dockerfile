FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

ENV NEXT_PUBLIC_API_URL=https://statistics-api.wildberries.ru/api/v1/supplier

EXPOSE 3000

CMD ["npm", "start"]