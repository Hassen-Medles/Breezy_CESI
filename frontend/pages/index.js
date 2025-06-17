import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FooterSimple } from "../components/Footers";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center">
        <form
          className="bg-white rounded-lg shadow-md p-6 w-full max-w-xs flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-5">
            <label htmlFor="username" className="block mb-1 font-mono text-lg">
              Identifiant
            </label>
            <input
              id="username"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12F146]"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-mono text-lg">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12F146]"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4CC3FF] hover:bg-[#38aeea] text-white text-lg font-semibold py-3 rounded-lg transition"
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
      <FooterSimple />
    </div>
  );
}