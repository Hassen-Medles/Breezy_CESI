'use client';
import React, { useEffect, useState } from "react";
import CommentForm from "./CommentForm";

function PostCard({ post, onPostUpdated, openCommentPostId, setOpenCommentPostId }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Charger les commentaires quand on ouvre la section
  useEffect(() => {
    if (openCommentPostId === post._id) {
      setLoadingComments(true);
      fetch(`/api/comments/post/${post._id}`)
        .then(res => res.json())
        .then(data => setComments(Array.isArray(data) ? data : []))
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [openCommentPostId, post._id]);

  // Ajouter un commentaire
  const handleAddComment = async (content) => {
    try {
      const res = await fetch(`http://localhost:5001/api/comments/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout du commentaire");
      const { comment } = await res.json();
      setComments(prev => [...prev, comment]);
    } catch (err) {
      alert(err.message);
    }
  };

  // ...le reste du composant PostCard reste inchangé jusqu'à l'affichage des commentaires...

  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-3 flex flex-col shadow relative">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
        <span className="font-semibold text-sm">{post.author?.username || post.authorName || "Your name"}</span>
        <span className="ml-auto text-gray-400 text-xl cursor-pointer relative" onClick={() => setShowMenu(v => !v)}>•••
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleEdit}>Modifier</button>
            </div>
          )}
        </span>
      </div>
      {isEditing ? (
        <>
          <textarea
            className="w-full border rounded p-2 mb-2"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            maxLength={280}
          />
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSave} disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>Annuler</button>
          </div>
          {error && <div className="text-red-500 mt-1">{error}</div>}
        </>
      ) : (
        <div className="text-base mb-2">{post.content}</div>
      )}
      <div className="flex items-center text-xs text-gray-400 mb-1">
        {post.createdAt && (
          <span>
            {new Date(post.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{" "}
            {new Date(post.createdAt).toLocaleDateString("fr-FR")}
          </span>
        )}
        <span className="ml-1">{comments.length}</span>
      </div>
      {/* Affiche les commentaires si la bulle est cliquée */}
      {openCommentPostId === post._id && (
        <div className="mt-2">
          {loadingComments ? (
            <div>Chargement des commentaires...</div>
          ) : (
            <CommentForm
              comments={comments}
              onAddComment={handleAddComment}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function PostCardList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [apiError, setApiError] = useState("");
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:5001/api/posts/user/me", {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message || 'Erreur lors de la récupération des posts');
        setPosts([]);
        return;
      }
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError('Erreur réseau ou serveur.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const postsToShow = showAll ? posts : posts.slice(0, 3);

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="flex items-center mb-4">
        <span className="font-bold text-lg">Vos messages</span>
        <span className="ml-4 text-gray-400 text-lg">{posts.length} publications</span>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : apiError ? (
        <div className="text-red-500">{apiError}</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400">Aucun message trouvé.<br/></div>
      ) : (
        <>
          {postsToShow.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={fetchPosts}
              openCommentPostId={openCommentPostId}
              setOpenCommentPostId={setOpenCommentPostId}
            />
          ))}
          {posts.length > 3 && !showAll && (
            <button
              className="w-full mt-2 py-2 bg-white rounded shadow text-gray-700 font-semibold hover:bg-gray-200 transition"
              onClick={() => setShowAll(true)}
            >
              Voir plus
            </button>
          )}
          {showAll && posts.length > 3 && (
            <button
              className="w-full mt-2 py-2 bg-white rounded shadow text-gray-700 font-semibold hover:bg-gray-200 transition"
              onClick={() => setShowAll(false)}
            >
              Voir moins
            </button>
          )}
        </>
      )}
    </div>
  );
}