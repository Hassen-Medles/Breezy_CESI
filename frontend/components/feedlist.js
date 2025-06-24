import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CommentForm from "./CommentForm";

const FeedList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshPosts: fetchPosts,
  }));

  // Simule les commentaires pour chaque post
  const [comments, setComments] = useState({});

  const handleAddComment = async (postId, content) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/comments/${postId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
        });
        if (!res.ok) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
        }
        const data = await res.json();

        // Ajoute le commentaire localement pour affichage immédiat
        setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
        }));
    } catch (err) {
        alert(err.message);
    }
  };

  const handleOpenComments = async (postId) => {
    setOpenCommentPostId(openCommentPostId === postId ? null : postId);
    if (openCommentPostId !== postId) {
      // Charge les commentaires depuis l’API
      try {
        const res = await fetch(`http://localhost:5001/api/comments/post/${postId}`);
        const data = await res.json();
        setComments(prev => ({
          ...prev,
          [postId]: Array.isArray(data) ? data : []
        }));
      } catch (err) {
        setComments(prev => ({
          ...prev,
          [postId]: []
        }));
      }
    }
  };

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
                  <img src={post.author.profilePicture} alt="avatar" className="w-8 h-8 rounded-full mr-3 object-cover" />
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
                  className="ml-4 text-gray-500 hover:text-blue-500"
                  title="Commenter"
                  onClick={() => handleOpenComments(post._id)}
                >
                  💬
                </button>
              </div>
              {/* Affiche le formulaire si la bulle est cliquée */}
              {openCommentPostId === post._id && (
                <div className="mt-2">
                  <CommentForm
                    comments={comments[post._id] || []}
                    onAddComment={content => handleAddComment(post._id, content)}
                  />
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