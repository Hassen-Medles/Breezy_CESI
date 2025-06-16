import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/accueil");
      } else {
        const data = await res.json();
        setError(data.message || "Identifiant ou mot de passe incorrect.");
      }
    } catch (err) {
      console.error("Erreur dans /login :", err);
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <form
          className="bg-white shadow rounded p-6 w-full max-w-xs"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <label htmlFor="username" className="block text-black font-mono text-sm mb-1">
              Identifiant
            </label>
            <input
              id="username"
              type="text"
              className="w-full border rounded px-3 py-2 text-gray-700 text-sm focus:outline-none"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-black font-mono text-sm mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2 text-gray-700 text-sm focus:outline-none"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 rounded"
          >
            Se connecter
          </button>
          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        </form>
        <div>
          <p>
            Pas de compte ?{" "}
            <Link href="/register" style={{ color: "blue", textDecoration: "underline" }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </main>
      <footer className="border-t p-2 text-center text-xs text-gray-400"></footer>
    </div>
  );
}