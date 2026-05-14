#!/bin/sh
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.__env = {
    API_URL: "${API_URL}",
    KEYCLOAK_URL: "${KEYCLOAK_URL}",
    KEYCLOAK_REALM: "${KEYCLOAK_REALM}",
    KEYCLOAK_CLIENT_ID: "${KEYCLOAK_CLIENT_ID}",
};
EOF

exec nginx -g "daemon off;"
