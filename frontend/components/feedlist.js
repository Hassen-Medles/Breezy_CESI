import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CommentForm from "./CommentForm";

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
      setLikeCounts(prev => ({
        ...prev,
        [postId]: prev[postId] + (alreadyLiked ? -1 : 1)
      }));
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !alreadyLiked
      }));
    } catch (err) {
      alert(err.message);
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
    </div>
  );
});

export default FeedList;