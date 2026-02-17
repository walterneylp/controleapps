FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm install
COPY apps/backend ./apps/backend
RUN npm run build -w apps/backend

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
EXPOSE 3333
CMD ["node", "apps/backend/dist/index.js"]
