import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const FeedList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Expose la méthode refreshPosts au parent via ref
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
                  <img src={post.author.profilePicture} alt="avatar" className="w-8 h-8 rounded-full mr-3 object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
                )}
                <span className="font-semibold text-base text-gray-700">{post.author?.username || post.authorName || "<deleted user>"}</span>
              </div>
              <div className="text-base mb-2 text-gray-700">{post.content}</div>
              <div className="flex items-center text-sm text-gray-400">
                <span>{post.createdAt && (new Date(post.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + " " + new Date(post.createdAt).toLocaleDateString("fr-FR"))}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
});

export default FeedList;