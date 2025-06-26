'use client';
import React, { useRef } from "react";
import Navbar from "../../components/Navbar";
import PostForm from "../../components/PostForm";
import FeedList from "../../components/feedlist";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Accueil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const feedListRef = useRef();

  // Fonction appelée après la création d'un post pour rafraîchir le feed
  const handlePostCreated = () => {
    if (feedListRef.current && feedListRef.current.refreshPosts) {
      feedListRef.current.refreshPosts();
    }
  };

  useEffect(() => {
    fetch("/auth/accueil", {
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) {
          try { await res.json(); } catch {}
          router.push("/");
          setLoading(false);
          return null;
        }
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
      <Navbar title="POUR VOUS" showEnvelope />
      <div className="h-20" />
      <div className="pb-24">
        <PostForm onPostCreated={handlePostCreated} />
        <FeedList ref={feedListRef} user={user} followingOnly />
      </div>
    </>
  );
}