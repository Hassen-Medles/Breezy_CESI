"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
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
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-lg px-10 py-10 w-full max-w-lg flex flex-col gap-6"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Identifiant
          </label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-500 text-white font-semibold py-2 rounded-lg hover:bg-sky-600 transition duration-200"
      >
        Se connecter
      </button>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="text-center text-sm text-gray-600 mt-4">
        Pas de compte ?{" "}
        <Link href="/register" className="text-sky-500 font-medium hover:underline">
          Créer un compte
        </Link>
      </div>
    </form>
  </div>
);

}