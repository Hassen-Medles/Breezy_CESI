import React, { useState, useRef } from "react";
import { FaPhotoVideo, FaVideo, FaTags, FaTimes } from "react-icons/fa";

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef();
  const videoInputRef = useRef();
  const tagInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      tags.forEach(tag => formData.append("tags", tag));
      if (image) formData.append("image", image);
      if (video) formData.append("video", video);
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création du post");
      }
      setContent("");
      setTags([]);
      setTagInput("");
      setImage(null);
      setVideo(null);
      setPreview(null);
      setVideoPreview(null);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-white rounded shadow"
      encType="multipart/form-data"
    >
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Exprime-toi..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        required
      />
      <div className="mb-2">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs font-semibold flex items-center">
              #{tag}
              <button type="button" className="ml-1 text-sky-500 hover:text-red-500" onClick={() => removeTag(tag)} title="Supprimer ce tag">
                <FaTimes size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            ref={tagInputRef}
            className="border rounded p-1 text-xs"
            placeholder={tags.length === 0 ? "Ajouter un tag..." : "#tag"}
            value={tagInput}
            onChange={handleTagInput}
            onKeyDown={handleTagKeyDown}
            style={{ minWidth: 80, maxWidth: 120 }}
          />
        </div>
      </div>
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          className="flex items-center px-2 py-1 bg-sky-100 hover:bg-sky-200 rounded text-sky-700"
          onClick={() => imageInputRef.current.click()}
        >
          <FaPhotoVideo className="mr-2" /> Photo
        </button>
        <button
          type="button"
          className="flex items-center px-2 py-1 bg-indigo-100 hover:bg-indigo-200 rounded text-indigo-700"
          onClick={() => videoInputRef.current.click()}
        >
          <FaVideo className="mr-2" /> Vidéo
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        ref={imageInputRef}
      />
      {preview && (
        <div className="mb-2">
          <img
            src={preview}
            alt="Aperçu"
            className="max-h-40 rounded"
          />
        </div>
      )}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="hidden"
        ref={videoInputRef}
      />
      {videoPreview && (
        <div className="mb-2">
          <video src={videoPreview} controls className="max-h-40 rounded" />
        </div>
      )}
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
