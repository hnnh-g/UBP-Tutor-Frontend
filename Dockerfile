# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app (SPA output, not SSR)
COPY --from=builder /app/dist/UBP-Tutor-Frontend/browser /usr/share/nginx/html

# Copy entrypoint that writes config.js from env vars at container start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Default env vars (overridable at container run time)
ENV API_URL=/api
ENV KEYCLOAK_URL=http://localhost:8080
ENV KEYCLOAK_REALM=ubp-tutor
ENV KEYCLOAK_CLIENT_ID=ubp-frontend

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
