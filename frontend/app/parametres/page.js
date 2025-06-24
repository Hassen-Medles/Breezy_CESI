"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function ParametresPage() {
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "fr" : "fr");
  const [isPrivate, setIsPrivate] = useState(true);
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8">
      <h1 className="text-2xl font-bold mb-6 text-green-600">PARAMETRES</h1>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <span className="block font-semibold mb-2">Langue</span>
          <div className="flex flex-col gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`py-2 px-4 rounded border ${lang === l.code ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                onClick={() => handleLangChange(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
          <span className="block font-semibold mb-2">Confidentialité du compte</span>
          <button
            onClick={handlePrivacyChange}
            disabled={loadingPrivacy}
            className={`py-2 px-4 rounded border font-semibold ${isPrivate ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}
          >
            {isPrivate ? 'Compte privé (cliquer pour rendre public)' : 'Compte public (cliquer pour rendre privé)'}
          </button>
          {privacyMsg && <span className="text-xs text-gray-500 mt-1">{privacyMsg}</span>}
        </div>
        <button className="bg-white rounded-lg shadow p-4 text-gray-700 font-semibold border border-gray-200">Dark Mode</button>
        <button className="bg-white rounded-lg shadow p-4 text-gray-700 font-semibold border border-gray-200">Déconnexion</button>
      </div>
    </div>
  );
}
