"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/FooterSwitcher/Footers";
import FollowButton from "../../components/FollowButton";

function getUserIdFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
  if (!match) return null;
  try {
    const token = decodeURIComponent(match[1]);
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload._id || null;
  } catch {
    return null;
  }
}

export default function ProfilUserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  useEffect(() => {
    if (!userId) {
      router.push("/recherche");
      return;
    }
    fetch(`/api/user/${userId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) {
          router.push("/recherche");
          return null;
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
        if (data && data._id) {
          fetch(`/api/user/${data._id}/follow-counts`, { credentials: "include" })
            .then(res => res.ok ? res.json() : { followers: 0, following: 0 })
            .then(setFollowCounts);
        }
      })
      .catch(() => {
        router.push("/recherche");
      });
  }, [userId, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  // Debug : voir la structure de l'utilisateur récupéré
  console.log('USER DATA:', user);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="PROFIL" />
      <button onClick={() => router.push('/recherche')} className="absolute left-4 top-24 z-50 text-2xl text-sky-500 hover:text-sky-700 cursor-pointer transition-colors duration-200 bg-white rounded-full p-1 shadow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="h-20" />
      <main className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl px-8 py-10 space-y-10">
        {/* Section Profil en ligne */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start md:space-x-10 space-y-4 md:space-y-0">
          {/* Infos utilisateur à gauche (ou en haut sur mobile) */}
          <div className="flex flex-row items-center justify-center md:justify-start space-x-8 md:space-x-20 w-full h-full">
            {/* Avatar à gauche */}
            <div className="flex mt-4 flex-col items-center md:items-start w-fit">
              <div className="flex-shrink-0 w-20 h-20 md:w-36 md:h-36 md:-ml-8">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  {user && user.profilePicture ? (
                    <ProfileImage profilePicture={user.profilePicture} />
                  ) : (
                    <FaUserCircle size={50} className="md:size-[110px] text-sky-300" />
                  )}
                </div>
              </div>
            </div>
            {/* Infos utilisateur à droite */}
            <div className="flex mt-5 flex-col items-center justify-center text-center space-y-2 w-1/2 self-start md:self-center -mt-4">
              {/* Nom */}
              <h1 className="text-base md:text-2xl font-bold text-gray-800 break-all truncate">
                {user ? user.username : "Pseudos"}
              </h1>
              {/* Stats */}
              <div className="flex gap-8 md:gap-16 justify-center items-center w-full">
                <div className="text-center">
                  <p className="text-xs md:text-xl font-bold text-gray-800">{followCounts.followers}</p>
                  <p className="text-xs md:text-sm text-gray-500">Abonnés</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-xl font-bold text-gray-800">{followCounts.following}</p>
                  <p className="text-xs md:text-sm text-gray-500">Suivis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Description sous la photo, alignée à gauche */}
        <div className="flex flex-col items-start md:ml-12 mt-2 mb-4">
          <p
            className="text-xs px-3 md:text-base text-gray-600 max-w-xs break-words"
            style={{ marginTop: '-20px' }}
          >
            {user ? user.description : "Description"}
          </p>
          {/* Bouton suivre/ne plus suivre sous la description */}
          {user && user._id !== undefined && typeof window !== 'undefined' && user._id !== getUserIdFromCookie() && (
            <div className="mt-5">
              <FollowButton userId={user._id} isPrivate={user.isPrivate} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileImage({ profilePicture }) {
  const [error, setError] = useState(false);
  if (error || !profilePicture) {
    return <FaUserCircle size={50} className="md:size-[110px] text-sky-300" />;
  }
  let src = profilePicture.startsWith('http')
    ? profilePicture
    : `http://localhost:5000/uploads/${profilePicture}`;
  return (
    <img
      src={src}
      alt="Photo de profil"
      className="w-full h-full object-cover rounded-full border border-black"
      onError={() => setError(true)}
    />
  );
}
