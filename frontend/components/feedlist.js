import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CommentForm from "./CommentForm";

const REPORT_REASONS = [
  "Spam ou publicité",
  "Discours haineux ou harcèlement",
  "Nudité ou contenu sexuel",
  "Violence ou menace",
  "Fausses informations",
  "Autre"
];

const FeedList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [user, setUser] = useState(null);
  const [reportModal, setReportModal] = useState({ open: false, postId: null });
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  // Récupère les likes pour chaque post
  const fetchLikes = async (posts) => {
    const counts = {};
    const liked = {};
    await Promise.all(
      posts.map(async (post) => {
        try {
          const res = await fetch(`/api/posts/${post._id}/likes`, { credentials: 'include' });
          const data = await res.json();
          counts[post._id] = data.count || 0;
          liked[post._id] = !!data.liked;
        } catch {
          counts[post._id] = 0;
          liked[post._id] = false;
        }
      })
    );
    setLikeCounts(counts);
    setLikedPosts(liked);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed/following", { credentials: "include" })
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
      // ...reste du code pour charger les likes/commentaires...
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Charge les commentaires d'un post
  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments/post/${postId}`);
      const data = await res.json();
      setComments(prev => ({
        ...prev,
        [postId]: Array.isArray(data) ? data : []
      }));
    } catch {
      setComments(prev => ({
        ...prev,
        [postId]: []
      }));
    } finally {
      setLoadingComments(false);
    }
  };

  // Quand on clique sur la bulle
  const handleOpenComments = (postId) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
    } else {
      setOpenCommentPostId(postId);
      fetchComments(postId);
    }
  };

  // Ajout d'un commentaire
  const handleAddComment = async (postId, content, parent = null) => {
    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parent }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout du commentaire");
      const { comment } = await res.json();
      setCommentCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId] ? [comment, ...prev[postId]] : [comment]
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  // Like/unlike un post
  const handleLike = async (postId) => {
    const alreadyLiked = likedPosts[postId];
    try {
      const url = `/api/posts/${postId}/like`;
      const method = alreadyLiked ? 'DELETE' : 'POST';
      const res = await fetch(url, { method, credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du like');
      // Recharge les likes depuis le backend pour avoir le vrai total
      await fetchLikes(posts);
    } catch (err) {
      alert(err.message);
    }
  };

  // Fonction pour ouvrir la modale de signalement
  const openReportModal = (postId) => {
    setReportModal({ open: true, postId });
    setSelectedReason(REPORT_REASONS[0]);
    setReportMessage("");
  };
  // Fonction pour fermer la modale
  const closeReportModal = () => {
    setReportModal({ open: false, postId: null });
    setReportMessage("");
  };
  // Fonction pour signaler un post avec motif
  const handleReport = async () => {
    if (!reportModal.postId) return;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/posts/${reportModal.postId}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: selectedReason })
      });
      const data = await res.json();
      if (res.ok) {
        setReportMessage("Post signalé ! Merci pour votre retour.");
        setTimeout(() => closeReportModal(), 1200);
      } else {
        setReportMessage(data.message || "Erreur lors du signalement.");
      }
    } catch (err) {
      setReportMessage("Erreur lors du signalement.");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshPosts: fetchPosts,
  }));

  return (
    <div className="bg-gray-100 rounded-xl p-4 mt-6">
      <div className="flex items-center mb-4">
        <span className="font-bold text-lg">Tous les posts</span>
        <span className="ml-4 text-gray-400 text-lg">{posts.length} publications</span>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400">Aucun post trouvé.<br/></div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post._id} className="bg-white border rounded-lg mb-3 p-4 shadow-sm mt-2">
              <div className="flex items-center gap-2 mb-1">
                {post.author?.profilePicture ? (
                  <img
                    src={
                      post.author.profilePicture && post.author.profilePicture.startsWith('http')
                        ? post.author.profilePicture
                        : post.author.profilePicture
                          ? `http://localhost:5000/uploads/${post.author.profilePicture}`
                          : '/defaultimage.png'
                    }
                    alt="Photo de profil"
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                    onError={e => {
                      if (e.target.src.endsWith('/defaultimage.png')) return;
                      e.target.onerror = null;
                      e.target.src = '/defaultimage.png';
                      e.target.className = 'w-8 h-8 object-cover rounded-full';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
                )}
                <span className="font-semibold text-base text-gray-700">{post.author?.username || post.authorName || "<deleted user>"}</span>
              </div>
              <div className="text-base mb-2 text-gray-700">{post.content}</div>
              <div className="flex items-center text-sm text-gray-400 gap-4">
                <span>
                  {post.createdAt && (new Date(post.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + " " + new Date(post.createdAt).toLocaleDateString("fr-FR"))}
                </span>
                <button
                  className={
                    `ml-4 flex items-center gap-1 px-2 py-1 rounded-full border transition-all duration-200 ` +
                    (likedPosts[post._id]
                      ? 'bg-pink-100 border-pink-300 text-pink-600 shadow-sm scale-105'
                      : 'bg-white border-gray-300 text-gray-400 hover:bg-pink-50 hover:text-pink-500')
                  }
                  title={likedPosts[post._id] ? "Je n'aime plus" : "J'aime"}
                  style={{ cursor: "pointer", fontWeight: 600, fontSize: '1.1rem', minWidth: 36, position: 'relative', overflow: 'hidden' }}
                  onClick={() => handleLike(post._id)}
                >
                  <span
                    className={
                      'transition-all duration-200 ' +
                      (likedPosts[post._id] ? 'heart-pop' : '')
                    }
                    style={{ fontSize: '1.3rem', lineHeight: 1 }}
                  >
                    {likedPosts[post._id] ? "❤️" : "🤍"}
                  </span>
                  <span className="font-semibold text-sm" style={{ minWidth: 18, textAlign: 'center' }}>{likeCounts[post._id] ?? 0}</span>
                </button>
                <button
                  className="ml-4 text-gray-500 hover:text-blue-500"
                  title="Afficher les commentaires"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => handleOpenComments(post._id)}
                >
                  💬
                </button>
                <span className="ml-1">{commentCounts[post._id] ?? 0}</span>
                {/* Bouton signalement */}
                <button
                  className="ml-auto text-red-400 hover:text-red-600"
                  title="Signaler ce post"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                  onClick={() => openReportModal(post._id)}
                >
                  🚩
                </button>
              </div>
              {openCommentPostId === post._id && (
                <div className="mt-2">
                  {loadingComments ? (
                    <div>Chargement des commentaires...</div>
                  ) : (
                    <CommentForm
                      comments={comments[post._id] || []}
                      onAddComment={(content, parent) => handleAddComment(post._id, content, parent)}
                      allComments={comments[post._id] || []}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
      {/* Modale de signalement améliorée */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-200 animate-fadein">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-200 animate-fadein-card">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
              onClick={closeReportModal}
              disabled={reportLoading}
              aria-label="Fermer"
              style={{ background: 'none', border: 'none' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
            </button>
            <h3 className="font-bold text-lg mb-3 text-gray-800 text-center">Signaler ce post</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 text-sm">Motif :</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 focus:outline-none text-gray-700 bg-gray-50"
                value={selectedReason}
                onChange={e => setSelectedReason(e.target.value)}
                disabled={reportLoading}
              >
                {REPORT_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg border border-gray-200 transition-colors"
                onClick={closeReportModal}
                disabled={reportLoading}
              >
                Annuler
              </button>
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
                onClick={handleReport}
                disabled={reportLoading}
              >
                {reportLoading ? "Signalement..." : "Signaler"}
              </button>
            </div>
            {reportMessage && <div className="mt-3 text-center text-sm text-green-600 animate-fadein">{reportMessage}</div>}
          </div>
        </div>
      )}
      {/* Ajout des animations CSS */}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein { animation: fadein 0.2s; }
        @keyframes fadein-card {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadein-card { animation: fadein-card 0.25s; }
      `}</style>
    </div>
  );
});

export default FeedList;