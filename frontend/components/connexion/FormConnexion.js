// frontend/components/FormConnexion.jsx
import React from 'react';

export default function FormConnexion() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="text-2xl font-bold text-blue-600 mb-4">CONNEXION</div>
      <div className="bg-white p-6 rounded shadow-md w-80">
        <label className="block mb-2 font-mono">Identifiant</label>
        <input type="text" className="w-full px-3 py-2 border rounded mb-4" />

        <label className="block mb-2 font-mono">Mot de passe</label>
        <input type="password" className="w-full px-3 py-2 border rounded mb-6" />

        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
          Se connecter
        </button>
      </div>
    </div>
  );
}
