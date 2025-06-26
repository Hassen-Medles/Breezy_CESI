import { useState } from "react";

export default function CommentForm({
  comments = [],
  onAddComment,
  allComments,
  parentId = null,
  level = 0,
}) {
  // Pour le champ d'ajout de commentaire racine
  const [rootContent, setRootContent] = useState("");
  // Pour savoir à quel commentaire on répond
  const [replyTo, setReplyTo] = useState(null);
  // Pour stocker le contenu de CHAQUE champ de réponse à un commentaire
  const [replyInputs, setReplyInputs] = useState({});

  const replies = (commentId) =>
    allComments
      ? allComments.filter((c) => c.parent === commentId)
      : [];

  const currentLevelComments = comments.filter(
    (c) => (c.parent === parentId || (!c.parent && !parentId))
  );

  const handleRootSubmit = (e) => {
    e.preventDefault();
    if (!rootContent.trim()) return;
    if (onAddComment) onAddComment(rootContent, null);
    setRootContent("");
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    const content = replyInputs[commentId] || "";
    if (!content.trim()) return;
    if (onAddComment) onAddComment(content, commentId);
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    setReplyTo(null);
  };

  return (
    <div>
      {currentLevelComments.map((comment) => (
        <div key={comment._id} style={{ marginLeft: level * 24, marginTop: 8 }}>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-semibold">{comment.author?.username || "Anonyme"}</div>
              <div className="text-sm">{comment.content}</div>
              {level < 3 && (
                <button
                  className="text-xs text-blue-500 mt-1"
                  onClick={() => setReplyTo(comment._id)}
                >
                  ↪
                </button>
              )}
            </div>
          </div>
          {/* Champ de réponse sous le bon commentaire */}
          {replyTo === comment._id && (
            <form
              onSubmit={e => handleReplySubmit(e, comment._id)}
              className="flex items-center gap-2 ml-8 mt-1"
            >
              <input
                type="text"
                className="flex-1 border border-gray-300 focus:border-sky-400 focus:ring-sky-400 rounded-full px-3 py-1 text-sm outline-none transition-colors"
                placeholder="Votre réponse..."
                value={replyInputs[comment._id] || ""}
                onChange={e =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [comment._id]: e.target.value,
                  }))
                }
                maxLength={280}
              />
              <button
                type="submit"
                className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
                title="Envoyer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          )}
          {/* Affiche les réponses récursivement */}
          {replies(comment._id).length > 0 && (
            <CommentForm
              comments={replies(comment._id)}
              onAddComment={onAddComment}
              allComments={allComments}
              parentId={comment._id}
              level={level + 1}
            />
          )}
        </div>
      ))}
      {/* Champ d'ajout de commentaire racine */}
      {level === 0 && (
        <form
          onSubmit={handleRootSubmit}
          className="flex items-center gap-2 mt-2"
        >
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <input
            type="text"
            className="flex-1 border border-gray-300 focus:border-sky-400 focus:ring-sky-400 rounded-full px-3 py-1 text-sm outline-none transition-colors"
            placeholder="Votre commentaire..."
            value={rootContent}
            onChange={e => setRootContent(e.target.value)}
            maxLength={280}
          />
          <button
            type="submit"
            className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
            title="Envoyer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      )}
    </div>
  );
}