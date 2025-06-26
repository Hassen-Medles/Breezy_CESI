// Utilitaire pour obtenir l'URL de la photo de profil avec fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export default function getProfilePictureUrl(profilePicture) {
  if (!profilePicture) return '/defaultimage.png';
  if (profilePicture.startsWith('http')) return profilePicture;
  // Corrige le clignotement : toujours retourner une URL complète
  if (profilePicture.startsWith('/uploads/')) {
    return `${API_URL}${profilePicture}`;
  }
  // Si jamais profilePicture est déjà juste le nom du fichier
  return `${API_URL}/uploads/${profilePicture}`;
}
