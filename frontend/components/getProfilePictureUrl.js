// Utilitaire pour obtenir l'URL de la photo de profil avec fallback
export default function getProfilePictureUrl(profilePicture) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // port 5000 comme dans Friend.js
  if (!profilePicture) {
    // Fallback image locale
    return '/defaultimage.png';
  }
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  if (profilePicture.startsWith('/uploads/')) {
    return `${API_URL}${profilePicture}`;
  }
  // Cas chemin relatif (backend)
  return `${API_URL}/uploads/${profilePicture}`;
}
