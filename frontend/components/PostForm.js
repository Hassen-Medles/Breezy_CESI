import React, { useState } from "react";

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création du post");
      }
      setContent("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded shadow">
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Exprime-toi..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Publication..." : "Publier"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
