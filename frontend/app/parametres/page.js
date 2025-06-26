"use client";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaGlobe, FaUserShield, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function ParametresPage() {
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "fr" : "fr");
  const [isPrivate, setIsPrivate] = useState(null); // null = loading
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Récupérer la valeur actuelle du mode privé/public
    fetch("/api/user/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.isPrivate === "boolean") setIsPrivate(data.isPrivate);
      });
  }, []);

  const handleLangChange = (code) => {
    setLang(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", code);
    }
  };

  const handlePrivacyChange = async () => {
    setLoadingPrivacy(true);
    setPrivacyMsg("");
    try {
      const res = await fetch("/api/user/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPrivate: !isPrivate })
      });
      const data = await res.json();
      if (res.ok) {
        setIsPrivate(data.isPrivate);
        setPrivacyMsg(data.message);
      } else {
        setPrivacyMsg(data.message || "Erreur lors du changement de confidentialité.");
      }
    } catch {
      setPrivacyMsg("Erreur réseau.");
    } finally {
      setLoadingPrivacy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Navbar sticky en haut */}
      <Navbar title="PARAMETRE" />
      {/* Espace pour la navbar sticky */}
      <div className="h-20" />
      <div className="w-full flex flex-col gap-8 mt-2 px-2 sm:px-4 items-center">
        <div className="w-full max-w-sm flex flex-col gap-8 pb-24">
          {/* Bouton retour */}
          <button
            onClick={() => router.push('/profil')}
            className="flex items-center gap-2 mb-2 text-black font-medium text-base hover:text-blue-600 focus:text-blue-600 transition-colors self-start"
            style={{ background: 'none', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', cursor: 'pointer' }}
          >
            <FaArrowLeft className="text-lg" />
            <span>Retour au profil</span>
          </button>
          {/* Langue */}
          <div className="bg-white rounded-3xl shadow-xl p-7 transition hover:shadow-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-5">
              <FaGlobe className="text-sky-500 text-xl" />
              <span className="text-xl font-bold text-black">Langue</span>
            </div>
            <div className="flex flex-col gap-3 items-center w-full">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`px-6 py-2 rounded-xl font-medium transition border text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 min-w-[130px] w-auto text-center
                  ${
                    lang === l.code
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-transparent opacity-80'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-sky-50 hover:scale-105'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidentialité */}
          <div className="bg-white rounded-3xl shadow-xl p-7 transition hover:shadow-2xl border border-indigo-100">
            <div className="flex items-center gap-3 mb-5">
              <FaUserShield className="text-sky-500 text-xl" />
              <span className="text-xl font-bold text-black">Confidentialité du compte</span>
            </div>
            <div className="flex justify-center w-full">
              {isPrivate === null ? (
                <button
                  className="px-6 py-2 rounded-xl font-semibold transition text-base border shadow-sm min-w-[160px] w-auto text-center bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed animate-pulse"
                  disabled
                >
                  Chargement...
                </button>
              ) : (
                <button
                  onClick={handlePrivacyChange}
                  disabled={loadingPrivacy}
                  className={`px-6 py-2 rounded-xl font-semibold transition text-base border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px] w-auto text-center
                    ${isPrivate
                      ? 'bg-gray-100 border-gray-300 text-red-700 hover:bg-sky-50 hover:scale-105'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-transparent opacity-80'}`}
                >
                  {isPrivate
                    ? 'Compte privé'
                    : 'Compte public'}
                </button>
              )}
            </div>
            {privacyMsg && <p className="text-xs text-gray-500 mt-3">{privacyMsg}</p>}
          </div>

          {/* Dark Mode */}
          <div className="flex items-center gap-3 mb-5 bg-white rounded-3xl shadow-xl p-5 border border-gray-200">
            <FaMoon className="text-gray-500 text-xl" />
            <span className="text-xl font-bold text-black">Mode sombre</span>
          </div>

          {/* Déconnexion */}
          <button
            onClick={async () => {
              try {
                await fetch("/api/user/logout", { method: "POST", credentials: "include" });
                await fetch("/auth/logout", { method: "POST", credentials: "include" });
              } catch (e) {
              }
              router.push("/");
            }}
            className="flex items-center gap-3 mb-5 bg-white rounded-3xl shadow-xl p-5 border border-gray-200 w-full"
          >
            <FaSignOutAlt className="text-red-500 text-xl" />
            <span className="text-xl font-bold text-black-600">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}