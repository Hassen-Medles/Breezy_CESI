"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserCircle,
  FaBookmark,
  FaHeart,
  FaEllipsisH,
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/FooterSwitcher/Footers";
import PostCardList from "../../components/PostCardList";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const router = useRouter();

  useEffect(() => {
    fetch("/auth/profile", {
      credentials: "include"
    })
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
        if (data && data._id) {
          fetch(`/api/user/${data._id}/follow-counts`, { credentials: "include" })
            .then(res => res.ok ? res.json() : { followers: 0, following: 0 })
            .then(setFollowCounts);
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="PROFIL" />
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl px-8 py-10 mt-8 space-y-10">
        {/* Section Profil en ligne */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start md:space-x-10 space-y-4 md:space-y-0">
          {/* Infos utilisateur à gauche (ou en haut sur mobile) */}
          <div className="flex flex-row items-center justify-center md:justify-start space-x-8 md:space-x-20 w-full h-full">
            {/* Avatar à gauche */}
            <div className="flex flex-col items-center md:items-start w-fit">
              <div className="flex-shrink-0 w-20 h-20 md:w-36 md:h-36 md:-ml-8"> {/* Décalage à gauche sur desktop */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-indigo-400 p-1 shadow-md">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    {user && user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Photo de profil"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaUserCircle size={50} className="md:size-[110px] text-sky-300" />
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs mt-5 md:text-base text-gray-600 max-w-xs md:max-w-md break-words">
                {user ? user.description : "Description"}
              </p>
            </div>
            {/* Infos utilisateur à droite */}
            <div className="flex flex-col items-center justify-center text-center space-y-2 w-1/2 self-start md:self-center -mt-4">
              {/* Nom */}
              <h1 className="text-base md:text-2xl font-bold text-gray-800 break-all truncate">
                {user ? user.username : "Pseudos"}
              </h1>
              {/* Stats */}
              <div className="flex gap-8 md:gap-16 justify-center items-center w-full">
                <div className="text-center">
                  <p className="text-xs md:text-xl font-bold text-gray-800">{followCounts.following}</p>
                  <p className="text-xs md:text-sm text-gray-500">Abonnés</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-xl font-bold text-gray-800">{followCounts.followers}</p>
                  <p className="text-xs md:text-sm text-gray-500">Suivis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Description et bouton paramètres sous la photo, alignés à gauche */}
        <div className="flex flex-col items-start md:ml-12 mt-2 mb-4">
          <button
            className="mt-2 bg-gray-200 text-gray-700 py-1 md:py-2 px-3 md:px-6 rounded-xl text-xs md:text-base font-semibold hover:bg-gray-300"
            onClick={() => window.location.href = '/parametres'}
          >
            Paramètres
          </button>
        </div>
        {/* Messages dynamiques */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Vos messages</h2>
          <div className="bg-gray-100 rounded-2xl p-6 shadow-inner">
            {user && user._id ? (
              <PostCardList userId={user._id} />
            ) : (
              <div className="text-red-500">Impossible de récupérer le profil utilisateur</div>
            )}
          </div>
        </div>

        {/* Bulles */}
        <div className="flex justify-center gap-8 flex-wrap mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <FiPlus className="text-3xl text-gray-400" />
              </div>
              <span className="text-sm mt-1 text-gray-500">Name</span>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}