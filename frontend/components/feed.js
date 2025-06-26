import { useState } from 'react';
import { FaHeart, FaRegComment } from "react-icons/fa";

const mockPosts = [
  {
    id: 1,
    author: 'Name',
    content: 'Bonjour tout le monde :) Ca va ??',
    createdAt: '8:45 21 juin 2025',
  },
];

export default function Feed() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState(mockPosts);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosts([
      {
        id: Date.now(),
        author: 'Your Name',
        content,
        createdAt: new Date().toLocaleString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      },
      ...posts,
    ]);
    setContent('');
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-200 p-4 flex items-center gap-2">
        <span className="text-3xl font-bold">🌀</span>
        <h1 className="text-xl font-bold mx-auto">POUR VOUS</h1>
      </div>

      {/* Create Post */}
      <form onSubmit={handleSubmit} className="bg-white p-4 flex flex-col gap-2 shadow">
        <input
          type="text"
          placeholder="Your Name"
          className="border rounded px-2 py-1 mb-2"
          disabled
          value="Your Name"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Bonjour ...."
            className="flex-1 border rounded px-2 py-2"
            maxLength={280}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="bg-black text-white rounded-full p-2 hover:bg-gray-800"
            title="Envoyer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-2">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
              <div>
                <div className="font-semibold">{post.author}</div>
                <div className="text-xs text-gray-400">{post.createdAt}</div>
              </div>
            </div>
            <div className="mb-2 text-gray-800">{post.content}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <button className="text-red-500 flex items-center">
                  <FaHeart className="mr-1" />
                  <span>0</span>
                </button>
                <button className="text-gray-500 flex items-center">
                  <FaRegComment className="mr-1" />
                  <span>0</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        ::selection {
          background: #38bdf8; /* sky-400 */
          color: #fff;
        }
        input:focus, textarea:focus, select:focus, button:focus {
          outline: 2px solid #38bdf8 !important; /* sky-400 */
          outline-offset: 2px;
          box-shadow: 0 0 0 2px #38bdf833;
          border-color: #38bdf8 !important;
        }
      `}</style>
    </div>
  );
}