"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

function getApiUrl(path) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  return base.replace(/\/$/, "") + path;
}

function getProfilePictureUrl(profilePicture) {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  // Utilise l'URL du service auth-service (port 5000)
  const uploadBase = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000/uploads/';
  return uploadBase.replace(/\/$/, '') + '/' + profilePicture;
}

export default function ModifierProfil() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetch(getApiUrl("/profile"), { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUser(data);
          setUsername(data.username || "");
          setDescription(data.description || "");
          setPreview(getProfilePictureUrl(data.profilePicture));
        }
      });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("description", description);
      if (profilePicture) formData.append("profilePicture", profilePicture);
      const res = await fetch(getApiUrl("/profile"), {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profil mis à jour !");
        setTimeout(() => router.push("/profil"), 1200);
      } else {
        setMessage(data.message || "Erreur lors de la mise à jour.");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="MODIFIER" />
      <div className="h-20" />
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 mt-8 flex flex-col gap-6">
        <div className="flex flex-row justify-end gap-2 mb-4">
          <button
            type="button"
            className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-1 px-4 rounded-xl text-xs font-semibold hover:bg-gray-300"
            onClick={() => window.location.href = '/parametres'}
          >
            Paramètres
          </button>
          <button
            type="submit"
            className="bg-white border border-sky-500 text-sky-500 py-1 px-4 rounded-xl text-xs font-semibold hover:bg-sky-50 transition"
            disabled={loading}
          >
            Enregistrer
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="profilePicture" className="cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-sky-300 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img src={preview} alt="Aperçu" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-gray-400">Aucune photo</span>
              )}
            </div>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
          <button type="button" className="text-sky-500 text-xs mt-1 hover:underline" onClick={() => fileInputRef.current.click()}>
            Changer la photo
          </button>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Nom d'utilisateur</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition mb-3"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={30}
            required
            placeholder="Nom d'utilisateur"
          />
          <label className="block text-gray-700 font-semibold mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Décris-toi en quelques mots..."
          />
        </div>
        {message && <div className="text-center text-sm mt-2 text-sky-600">{message}</div>}
      </form>
    </div>
  );
}