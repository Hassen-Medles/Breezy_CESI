"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function ParametresPage() {
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "fr" : "fr");
  const router = useRouter();

  const handleLangChange = (code) => {
    setLang(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", code);
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
        <button className="bg-white rounded-lg shadow p-4 text-gray-700 font-semibold border border-gray-200">Dark Mode</button>
        <button className="bg-white rounded-lg shadow p-4 text-gray-700 font-semibold border border-gray-200">Déconnexion</button>
      </div>
    </div>
  );
}
