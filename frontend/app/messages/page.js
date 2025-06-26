"use client";
import Navbar from "../../components/Navbar";
import Friend from "../../components/Friend";
import SearchBar from "../../components/Searchbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Messages() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        // 1. Récupère la liste des suivis
        const res = await fetch("/api/friend/following", { credentials: "include" });
        const followed = await res.json(); // [{_id, username, ...}]
        // 2. Filtre pour ne garder que ceux qui te suivent aussi
        const mutuals = [];
        for (const user of followed) {
          // Vérifie si user te suit
          const statusRes = await fetch(`/api/friend/isfollower/${user._id}`, { credentials: "include" });
          const status = statusRes.ok ? await statusRes.json() : { following: false };
          if (status.following) {
            mutuals.push(user);
          }
        }
        // 3. Pour chaque suivi mutuel, récupère le dernier message échangé
        const friendsWithLastMsg = await Promise.all(
          mutuals.map(async (user) => {
            const msgRes = await fetch(`/api/messages/last/${user._id}`, { credentials: "include" });
            const lastMsg = msgRes.ok ? await msgRes.json() : null;
            return {
              ...user,
              lastMsg: lastMsg?.content || "",
              lastMsgTime: lastMsg?.createdAt || "",
              lastMsgRead: lastMsg?.read || false,
              lastMsgFrom: lastMsg?.from || lastMsg?.senderId || null,
            };
          })
        );
        setFriends(friendsWithLastMsg);
      } catch (err) {
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleGoToConversation = async (friendId) => {
    const res = await fetch(`/api/conversations/with/${friendId}`, { credentials: "include" });
    if (res.ok) {
      const conv = await res.json();
      router.push(`/conversation/${conv._id}`);
    } else {
      const data = await res.json();
      alert(data.message || "Impossible d'ouvrir la conversation.");
    }
  };

  return (
    <>
      <Navbar title="MESSAGES" />
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
        <SearchBar />
        {/* Ajout d'un margin-top pour éviter la collision avec la navbar */}
        <div className="flex-1 overflow-y-auto w-full max-w-md pb-20 mt-20">
          {loading ? (
            <div className="text-gray-400 text-center mt-8">Chargement...</div>
          ) : (
            <ul>
              {friends.map(friend => (
                <li key={friend._id}>
                  <button onClick={() => handleGoToConversation(friend._id)} className="w-full text-left">
                    <Friend
                      name={friend.username}
                      content={friend.lastMsg}
                      messageread={friend.lastMsgRead}
                      time={friend.lastMsgTime ? `Vu il y a ${formatTimeAgo(friend.lastMsgTime)}` : ""}
                      photo={friend.profilePicture || friend.photo}
                      isUnreadFromFriend={friend.lastMsg && !friend.lastMsgRead && friend.lastMsgFrom === friend._id}
                    />
                  </button>
                </li>
              ))}
              {friends.length === 0 && (
                <div className="text-gray-400 text-center mt-8">Aucun ami suivi.</div>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// Utilitaire pour afficher "il y a X min/h"
function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return date.toLocaleDateString();
}