import { useState } from "react";

export default function CommentForm({ comments = [], onAddComment }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (onAddComment) onAddComment(content);
    setContent("");
  };

  return (
    <div className="bg-white rounded-xl shadow p-3 flex flex-col gap-2">
      {/* Liste des commentaires */}
      <div className="flex flex-col gap-1">
        {comments.map((comment, idx) => (
          <div key={comment._id || idx} className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-semibold">{comment.author?.username || "Anonyme"}</div>
              <div className="text-sm">{comment.content || comment}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Champ d'ajout de commentaire */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-full bg-gray-200" />
        <input
          type="text"
          className="flex-1 border rounded-full px-3 py-1 text-sm"
          placeholder="Votre commentaire..."
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={280}
        />
        <button
          type="submit"
          className="bg-black text-white rounded-full p-2 hover:bg-gray-800"
          title="Envoyer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </form>
    </div>
  );
}