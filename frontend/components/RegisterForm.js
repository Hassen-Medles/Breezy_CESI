"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
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
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
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
      const res = await fetch("http://localhost:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      if (res.ok) {
        setShowCodeModal(false);
        setCodeError("");
        router.push("/accueil");
      } else {
        const data = await res.json();
        setCodeError(data.message || "Code incorrect.");
      }
    } catch (err) {
      setCodeError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div>
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom d'utilisateur :</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email :</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Confirmer le mot de passe :</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Créer un compte</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {showCodeModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={handleCodeSubmit} style={{
            background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <h2>Vérification email</h2>
            <p>Un code à 6 chiffres a été envoyé à votre adresse mail.</p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Code à 6 chiffres"
              required
            />
            {codeError && <p style={{ color: "red" }}>{codeError}</p>}
            <div style={{ marginTop: "1rem" }}>
              <button type="submit">Valider</button>
              <button
                type="button"
                style={{ marginLeft: "1rem" }}
                onClick={() => {
                  setShowCodeModal(false);
                  setCode("");
                  setCodeError("");
                  router.push("/accueil");
                }}
              >
                Plus tard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}