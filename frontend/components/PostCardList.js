/* 'use client';
import React, { useEffect, useState } from "react";

function PostCard({ post }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-3 flex flex-col shadow">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
        <span className="font-semibold text-sm">{post.authorName || "Your name"}</span>
        <span className="ml-auto text-gray-400 text-xl cursor-pointer">•••</span>
      </div>
      <div className="text-base mb-2">{post.content}</div>
      <div className="flex items-center text-xs text-gray-400 mb-1">
        {post.createdAt && (
          <span>{new Date(post.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
        )}
      </div>
      <div className="flex items-center mt-1">
        <div className="flex items-center mr-4">
          <span className="material-icons text-black text-base mr-1">💬</span>
          <span>125</span>
        </div>
        <div className="flex items-center">
          <span className="material-icons text-red-500 text-base mr-1">❤️</span>
          <span>2K</span>
        </div>
      </div>
    </div>
  );
}

export default function PostCardList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("http://localhost:5001/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="flex items-center mb-4">
        <span className="font-bold text-lg">Vos messages</span>
        <span className="ml-4 text-gray-400 text-lg">24 publications</span>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <>
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          <button className="w-full mt-2 py-2 bg-white rounded shadow text-gray-700 font-semibold hover:bg-gray-200 transition">Voir plus</button>
        </>
      )}
    </div>
  );
}
 */