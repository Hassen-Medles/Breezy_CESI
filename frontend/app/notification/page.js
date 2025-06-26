"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedLikes, setExpandedLikes] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/friend/received", { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
    fetch("/api/notification", { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => setNotifications(data));
  }, []);

  const handleAccept = async (id) => {
    await fetch("/api/friend/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ requestId: id })
    });
    setRequests(r => r.filter(req => req._id !== id));
  };
  const handleDecline = async (id) => {
    await fetch("/api/friend/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ requestId: id })
    });
    setRequests(r => r.filter(req => req._id !== id));
  };

  // Regrouper les likes par postId et collecter les utilisateurs
  const likeNotifs = notifications.filter(n => n.type === 'like' && n.postId && (Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000));
  const likesByPost = {};
  likeNotifs.forEach(n => {
    if (!likesByPost[n.postId]) likesByPost[n.postId] = { users: [], createdAt: n.createdAt };
    // Utiliser le vrai nom et la photo du liker
    const username = n.liker?.username || 'Quelqu’un';
    const profilePicture = n.liker?.profilePicture || null;
    if (!likesByPost[n.postId].users.find(u => u.username === username)) {
      likesByPost[n.postId].users.push({ username, profilePicture });
    }
    // Garder la date la plus récente
    if (new Date(n.createdAt) > new Date(likesByPost[n.postId].createdAt)) likesByPost[n.postId].createdAt = n.createdAt;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar title="NOTIFICATIONS" />
      <div className="h-20" />
      <div className="max-w-sm w-full mx-auto mt-6">
        <span className="block font-semibold text-lg mb-2">Demande d’amis</span>
        {requests.length === 0 && <div className="text-gray-400">Aucune demande</div>}
        {requests.length > 0 && (
          <div>
            {requests.length > 3 && !expanded ? (
              <button
                className="w-full bg-white rounded-lg shadow p-4 flex items-center justify-between mb-4 border border-gray-200 focus:outline-none"
                onClick={() => setExpanded(true)}
              >
                <span className="font-semibold">{requests.length} demandes</span>
                <span className="w-3 h-3 bg-blue-400 rounded-full inline-block"></span>
              </button>
            ) : null}
            {(expanded || requests.length <= 3) && (
              <div>
                {requests.map((req, i) => (
                  <div key={req._id} className="flex items-center gap-3 bg-white rounded-2xl shadow p-3 mb-2 border border-gray-100 w-full">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        {req.from && req.from.profilePicture ? (
                          <img
                            src={req.from.profilePicture.startsWith('http') ? req.from.profilePicture : `http://localhost:5000/uploads/${req.from.profilePicture}`}
                            alt="Photo de profil"
                            className="w-full h-full object-cover rounded-full"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = '/defaultimage.png';
                              e.target.className = 'w-full h-full object-cover rounded-full';
                            }}
                          />
                        ) : (
                          <span className="text-2xl text-sky-300"><svg width="32" height="32" fill="currentColor"><circle cx="16" cy="16" r="16" /></svg></span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{req.from?.username || 'Name'}</span>
                    <button className="ml-auto p-2 rounded-full hover:bg-sky-100 transition" onClick={() => handleAccept(req._id)} title="Accepter">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition" onClick={() => handleDecline(req._id)} title="Refuser">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {requests.length > 3 && expanded && (
                  <button
                    className="w-full mt-2 py-2 bg-gray-100 rounded shadow text-gray-700 font-semibold hover:bg-gray-200 transition"
                    onClick={() => setExpanded(false)}
                  >
                    Fermer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <span className="block font-semibold text-lg mb-2 mt-8">Likes</span>
        {Object.keys(likesByPost).length === 0 && <div className="text-gray-400">Aucun like</div>}
        {Object.keys(likesByPost).length > 0 && (
          <div>
            {Object.entries(likesByPost).map(([postId, info], i) => {
              const showAll = expandedLikes[postId];
              const userCount = info.users.length;
              // Afficher dans la ligne du haut seulement les deux premiers utilisateurs
              const displayUsers = userCount > 2 && !showAll ? info.users.slice(0, 2) : info.users;
              const displayNames = displayUsers.map(u => u.username).join(', ') + (userCount > 2 && !showAll ? ', ...' : '');
              return (
                <div
                  key={postId}
                  className="flex flex-col gap-2 bg-white rounded-2xl shadow p-3 mb-2 border border-gray-100 w-full cursor-pointer"
                  onClick={() => setExpandedLikes(e => ({ ...e, [postId]: !e[postId] }))}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {displayNames} {userCount > 1 ? 'ont' : 'a'} liké{userCount > 1 ? 's' : ''} votre post
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{new Date(info.createdAt).toLocaleString()}</span>
                  </div>
                  {showAll && userCount > 2 && (
                    <></>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}