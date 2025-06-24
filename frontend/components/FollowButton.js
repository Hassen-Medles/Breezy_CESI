"use client";
import { useState, useEffect } from "react";

export default function FollowButton({ userId, isPrivate, refreshProfile }) {
  const [following, setFollowing] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reloadStatus = () => {
    fetch(`/api/friend/following/${userId}`, { credentials: "include" })
      .then(res => res.ok ? res.json() : { following: false, pending: false })
      .then(data => {
        console.log('DEBUG /api/friend/following:', data); // <-- Ajout debug
        setFollowing(data.following);
        setPending(data.pending);
      });
  };

  useEffect(() => {
    reloadStatus();
  }, [userId]);

  const handleFollow = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/friend/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toUserId: userId })
    });
    const data = await res.json();
    if (res.ok) {
      reloadStatus();
      if (refreshProfile) refreshProfile();
    } else {
      setError(data.message || "Erreur");
    }
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/friend/unfollow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toUserId: userId })
    });
    const data = await res.json();
    if (res.ok) {
      reloadStatus();
      if (refreshProfile) refreshProfile();
    } else {
      setError(data.message || "Erreur");
    }
    setLoading(false);
  };

  if (loading) return <button className="py-2 px-6 rounded-xl bg-gray-200 text-gray-500 font-semibold">...</button>;
  if (following) return <button className="py-2 px-6 rounded-xl bg-red-100 text-red-600 font-semibold" onClick={handleUnfollow}>Ne plus suivre</button>;
  if (pending) return <button className="py-2 px-6 rounded-xl bg-yellow-100 text-yellow-600 font-semibold" disabled>En attente</button>;
  return <button className="py-2 px-6 rounded-xl bg-green-500 text-white font-semibold" onClick={handleFollow}>S'abonner</button>;
}
