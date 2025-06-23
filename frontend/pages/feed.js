import { useState } from 'react';

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
    // Ici tu feras un appel API pour publier le post
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
      <div className="flex-1 overflow-y-auto">
        {posts.map(post => (
          <div key={post.id} className="bg-white m-2 p-3 rounded shadow flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300" />
              <span className="font-semibold">{post.author}</span>
            </div>
            <div className="ml-10">{post.content}</div>
            <div className="flex items-center text-xs text-gray-400 ml-10">
              {post.createdAt}
            </div>
            <div className="flex items-center gap-4 ml-10 mt-1">
              <button className="text-xl">+</button>
              <button className="text-red-500 text-xl">♥</button>
              <button className="text-gray-500 text-xl">💬</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t flex justify-around items-center p-2 fixed bottom-0 left-0 right-0">
        <button className="text-2xl">🏠</button>
        <button className="text-2xl">🔍</button>
        <button className="text-2xl">🔔</button>
        <button className="text-2xl">👤</button>
      </nav>
    </div>
  );
}