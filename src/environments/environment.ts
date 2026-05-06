export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.API_URL) || '/api',
  keycloak: {
    url:
      (typeof window !== 'undefined' && (window as any).__env?.KEYCLOAK_URL) ||
      'http://localhost:8080',
    realm:
      (typeof window !== 'undefined' && (window as any).__env?.KEYCLOAK_REALM) || 'ubp-tutor',
    clientId:
      (typeof window !== 'undefined' && (window as any).__env?.KEYCLOAK_CLIENT_ID) ||
      'ubp-tutor-frontend',
  },
};
