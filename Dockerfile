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

# Default env vars (overridable at container run time)
ENV API_URL=/api
ENV KEYCLOAK_URL=http://localhost:8080
ENV KEYCLOAK_REALM=ubp-tutor
ENV KEYCLOAK_CLIENT_ID=ubp-tutor-frontend
ENV USE_MOCK_AUTH=false

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
