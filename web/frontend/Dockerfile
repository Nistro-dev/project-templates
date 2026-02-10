FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx config as template
COPY nginx.conf /etc/nginx/templates/default.conf.template
# nginx will automatically run envsubst on .template files
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
