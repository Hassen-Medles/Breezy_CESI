'use client';
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
// import FeedList from "../../components/feedlist"; // Désactivé temporairement pour ne pas interférer avec l'auth

export default function Accueil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar title="POUR VOUS" />
      {/*
        FeedList désactivé pour éviter les appels API posts.
        <FeedList />
      */}
      <div className="min-h-screen flex items-center justify-center">
        {loading ? (
          <p>Chargement...</p>
        ) : user ? (
          <p>Bienvenue, {user.email} !</p>
        ) : (
          <p>Bienvenue sur Breezy !</p>
        )}
      </div>
    </>
  );
}