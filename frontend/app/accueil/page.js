'use client';
import React, { useRef } from "react";
import Navbar from "../../components/Navbar";
import PostForm from "../../components/PostForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Accueil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/auth/accueil", {
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) {
          // Essaye de lire le JSON, sinon ignore l'erreur de parsing
          try { await res.json(); } catch {}
          router.push("/");
          setLoading(false);
          return null;
        }
        // Vérifie que la réponse est bien du JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          router.push("/");
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <>
      <PostForm onPostCreated={handlePostCreated} />
      <FeedList ref={feedListRef} />  
    </>
  );
}