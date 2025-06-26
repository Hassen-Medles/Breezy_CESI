// Ce composant détecte automatiquement l'URL de l'API selon l'environnement (localhost ou production)

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Si on est en local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    // Sinon, utilise le même domaine que le frontend
    return window.location.origin + '/api';
  }
  // Par défaut (SSR), retourne une valeur générique
  return '/api';
};

export default getApiBaseUrl;
