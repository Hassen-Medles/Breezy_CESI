"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = form.password;
    const specialCharRegex = /[/!@#$%^&*(),.?":{}|<>]/;

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!specialCharRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins un caractère spécial. Ex: /!@#$%^&*(),.?\":{}|<>");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      if (res.ok) {
        setPendingEmail(form.email);
        setShowCodeModal(true);
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'envoi du code.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code}),
        credentials: "include"
      });
      if (res.ok) {
        setShowCodeModal(false);
        setCodeError("");
        router.push("/registerprofil");
      } else {
        const data = await res.json();
        setCodeError(data.message || "Code incorrect.");
      }
    } catch (err) {
      setCodeError("Erreur de connexion au serveur.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-lg px-10 py-10 w-full max-w-lg flex flex-col gap-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
            autoComplete="new-password"
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2 rounded-lg hover:brightness-110 transition"
        >
          Créer un compte
        </button>
      </form>

      {showCodeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Vérification de l'email</h2>
            <p className="text-gray-600 text-sm text-center">
              Un code à 6 chiffres a été envoyé à votre adresse mail.
            </p>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code à 6 chiffres"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2 rounded-lg hover:brightness-110 transition"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeModal(false);
                    setCode("");
                    setCodeError("");
                    router.push("/registerprofil");
                  }}
                  className="w-full ml-4 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Plus tard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}