"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/friend/received", { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar title="NOTIFICATIONS" />
      <div className="max-w-md mx-auto mt-6">
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
                  <div key={req._id} className="flex items-center gap-3 bg-white rounded-lg shadow p-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      {req.from?.profilePicture ? (
                        <img src={req.from.profilePicture} alt={req.from.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>+</span>
                      )}
                    </div>
                    <span className="font-medium">{req.from?.username || 'Name'}</span>
                    <button className="ml-auto text-blue-500 text-2xl" onClick={() => handleAccept(req._id)}>✔️</button>
                    <button className="text-black text-2xl" onClick={() => handleDecline(req._id)}>✖️</button>
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
      </div>
    </div>
  );
}