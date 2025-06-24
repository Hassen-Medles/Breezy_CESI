"use client";
import Navbar from "../../components/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegComment } from "react-icons/fa";

export default function Recherche() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearched, setUserSearched] = useState(false);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar title="RECHERCHE"/>
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
                        <img src={u.profilePicture} alt={u.username} className="w-8 h-8 rounded-full mr-3" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                      )}
                      <span className="font-medium">{u.username}</span>
                      <span className="ml-2 text-gray-500 text-xs">{u.email}</span>
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
      <div className="px-2">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                <div>
                  <div className="font-semibold">{post.author?.name || "Name"}</div>
                  <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(post.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mb-2 text-gray-800">{post.content}</div>
              {post.comments && post.comments.length > 0 && (
                <div className="bg-gray-100 rounded p-2 mb-2">
                  {post.comments.map((c, i) => (
                    <div key={i} className="mb-1">
                      <span className="font-semibold text-sm">{c.author?.name || "Name"}</span>
                      <span className="ml-2 text-gray-700 text-sm">{c.content}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4">
                  <button className="text-red-500 flex items-center">
                    <FaHeart className="mr-1" />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button className="text-gray-500 flex items-center">
                    <FaRegComment className="mr-1" />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-8">Aucun post public trouvé.</div>
        )}
      </div>
    </div>
  );
}