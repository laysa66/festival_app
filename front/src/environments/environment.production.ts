// Environnement de production (serveur)
export const environment = {
  production: true,
  // En production, on utilise le proxy Nginx qui redirige /api vers le backend
  apiUrl: '/api'
};
