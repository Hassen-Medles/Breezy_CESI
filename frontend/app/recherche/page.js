"use client";
import Navbar from "../../components/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FeedList from "../../components/feedlist";

export default function Recherche() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearched, setUserSearched] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const router = useRouter();
  const debounceRef = useRef();

  useEffect(() => {
    fetch("/auth/recherche", { credentials: "include" })
      .then(res => {
        if (!res.ok) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  // Suggestions dynamiques à chaque frappe
  useEffect(() => {
    if (!search) {
      setUsers([]);
      setUserSearched(false);
      return;
    }
    setUserLoading(true);
    setUserSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(search)}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        console.log('Résultat recherche utilisateur:', data);
        setUsers(data);
      } else {
        setUsers([]);
      }
      setUserLoading(false);
      setUserSearched(true);
    }, 300); // 300ms debounce
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Récupérer les posts publics
  useEffect(() => {
    fetch("/api/posts", { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => setPosts(data));
  }, []);

  // Récupère les likes pour chaque post
  const fetchLikes = async (postsList) => {
    const counts = {};
    const liked = {};
    await Promise.all(
      postsList.map(async (post) => {
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
      if (!res.ok) {
        let msg = 'Erreur lors du like';
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {}
        await fetchLikes(posts);
        alert(msg);
        return;
      }
      await fetchLikes(posts);
    } catch (err) {
      await fetchLikes(posts);
      alert(err.message);
    }
  };

  // Synchronise likes et compteurs au chargement des posts
  useEffect(() => {
    if (posts.length > 0) {
      // Utilise une IIFE pour attendre la fin de fetchLikes avant de continuer
      (async () => {
        await fetchLikes(posts);
        // Compteurs de commentaires
        const counts = {};
        posts.forEach(post => {
          counts[post._id] = post.comments?.length || 0;
        });
        setCommentCounts(counts);
      })();
    }
  }, [posts]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar title="RECHERCHE"/>
      <div className="h-20" />
      <div className="relative flex items-center bg-white rounded-full shadow px-4 py-2 mx-2 mt-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche..."
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
        {/* Suggestions dynamiques */}
        {search && (
          <div className="absolute left-0 top-12 w-full bg-white rounded shadow z-10">
            {userLoading ? (
              <div className="p-2 text-gray-400 text-center">Recherche...</div>
            ) : users.length > 0 ? (
              <ul>
                {users.map(u => (
                  <li
                    key={u._id}
                    className="flex items-center py-2 px-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/profiluser?id=${u._id}`)}
                  >
                    <>
                      {u.profilePicture ? (
                        <img src={u.profilePicture.startsWith('http') ? u.profilePicture : `http://localhost:5000/uploads/${u.profilePicture}`} alt={u.username} className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-300" onError={e => { e.target.onerror = null; e.target.src = '/defaultimage.png'; e.target.className = 'w-8 h-8 rounded-full mr-3 bg-sky-300 object-cover'; }} />
                      ) : (
                        <span className="w-8 h-8 rounded-full mr-3 bg-sky-300 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#38BDF8"/>
                            <circle cx="12" cy="10" r="4" fill="#fff"/>
                            <ellipse cx="12" cy="18" rx="6" ry="3" fill="#fff"/>
                          </svg>
                        </span>
                      )}
                      <span className="font-medium">{u.username}</span>
                      <span className="ml-2 text-gray-500 text-xs">{u.email}</span>
                      <span className={`ml-3 text-xs font-semibold px-2 py-1 rounded ${u.isPrivate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {u.isPrivate ? 'Privé' : 'Public'}
                      </span>
                    </>
                  </li>
                ))}
              </ul>
            ) : userSearched ? (
              <div className="p-2 text-gray-400 text-center">Utilisateur introuvable</div>
            ) : null}
          </div>
        )}
      </div>
      {/* Affichage des posts publics via FeedList */}
      <div className="px-2">
        <FeedList publicOnly />
      </div>
    </div>
  );
}