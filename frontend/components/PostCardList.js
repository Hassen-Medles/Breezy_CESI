'use client';
import React, { useEffect, useState } from "react";
import CommentForm from "./CommentForm";

function PostCard({ post, onPostUpdated, onOpenComments, openCommentPostId, comments, loadingComments, onAddComment, commentCount }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5001/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-3 flex flex-col shadow relative">
      <div className="flex items-center mb-2">
        {post.author?.profilePicture ? (
          <img
            src={post.author.profilePicture}
            alt="Profil"
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
        )}
        <span className="font-semibold text-sm">
          {post.author?.username || post.username || "Utilisateur"}
        </span>
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
          <span>{new Date(post.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
        )}
      </div>
      <div className="flex items-center mt-1">
        <div className="flex items-center mr-4">
          <button
            className="text-black text-base mr-1"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            title="Afficher les commentaires"
            onClick={() => onOpenComments(post._id)}
          >
            💬
          </button>
          <span>{commentCount ?? 0}</span>
        </div>
        <div className="flex items-center">
          <span className="material-icons text-red-500 text-base mr-1">❤️</span>
          <span>2K</span>
        </div>
      </div>
      {openCommentPostId === post._id && (
        <div className="mt-2 w-full">
          {loadingComments ? (
            <div>Chargement des commentaires...</div>
          ) : (
            <CommentForm
              comments={comments[post._id] || []}
              onAddComment={content => onAddComment(post._id, content)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function PostCardList({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [apiError, setApiError] = useState("");
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});

  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`http://localhost:5001/api/comments/post/${postId}`);
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

  const handleOpenComments = (postId) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
    } else {
      setOpenCommentPostId(postId);
      fetchComments(postId);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const res = await fetch(`http://localhost:5001/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
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

  const fetchPosts = async () => {
    setLoading(true);
    setApiError("");
    if (!userId) {
      setApiError("ID utilisateur manquant");
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5001/api/posts/user/${userId}`, {
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
      // Charger les compteurs de commentaires
      if (Array.isArray(data)) {
        const counts = {};
        await Promise.all(
          data.map(async post => {
            try {
              const res = await fetch(`http://localhost:5001/api/comments/post/${post._id}`);
              const comments = await res.json();
              counts[post._id] = Array.isArray(comments) ? comments.length : 0;
            } catch {
              counts[post._id] = 0;
            }
          })
        );
        setCommentCounts(counts);
      }
    } catch (err) {
      setApiError('Erreur réseau ou serveur.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

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
              onOpenComments={handleOpenComments}
              openCommentPostId={openCommentPostId}
              comments={comments}
              loadingComments={loadingComments}
              onAddComment={handleAddComment}
              commentCount={commentCounts[post._id]}
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