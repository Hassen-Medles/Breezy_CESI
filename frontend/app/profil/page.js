"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/FooterSwitcher/Footers";
import FeedList from "../../components/feedlist";

function getProfilePictureUrl(profilePicture) {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  // Utilise l'URL du service auth-service (port 5000)
  const uploadBase = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000/uploads/';
  return uploadBase.replace(/\/$/, '') + '/' + profilePicture;
}

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
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
          fetch(`/api/user/${data._id}/posts`, { credentials: "include" })
            .then(res => res.ok ? res.json() : [])
            .then(setPosts);
        }
        // Ajout debug : log la valeur de profilePicture et l'URL générée
        if (data && data.profilePicture) {
          const url = getProfilePictureUrl(data.profilePicture);
          // eslint-disable-next-line no-console
          console.log('profilePicture:', data.profilePicture, 'URL utilisée:', url);
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
    <div className="min-h-screen flex flex-col">
      <Navbar title="PROFIL" />
      <div className="h-20" />
      <main className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl px-8 py-10 space-y-10">
        {/* Section Profil en ligne */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start md:space-x-10 space-y-4 md:space-y-0">
          {/* Infos utilisateur à gauche (ou en haut sur mobile) */}
          <div className="flex flex-row items-center justify-center md:justify-start space-x-8 md:space-x-20 w-full h-full">
            {/* Avatar à gauche */}
            <div className="flex mt-4 flex-col items-center md:items-start w-fit">
              <div className="flex-shrink-0 w-20 h-20 md:w-36 md:h-36 md:-ml-8"> {/* Décalage à gauche sur desktop */}
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  {user && user.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(user.profilePicture)}
                      alt="Photo de profil"
                      className="w-full h-full object-cover rounded-full border border-black"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/defaultimage.png';
                        e.target.className = 'w-full h-full object-cover rounded-full'; // retire la bordure si image par défaut
                      }}
                    />
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
          <p
            className="text-xs px-3 md:text-base text-gray-600 max-w-xs break-words"
            style={{ marginTop: '-20px' }}
          >
            {user ? user.description : "Description"}
          </p>
          <div className="flex gap-2 mt-5">
            <button
              className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-1 md:py-2 px-3 md:px-6 rounded-xl text-xs md:text-base font-semibold hover:bg-gray-300"
              onClick={() => window.location.href = '/parametres'}
            >
              Paramètres
            </button>
            <button
              className="bg-white border border-sky-500 text-sky-500 py-1 md:py-2 px-3 md:px-6 rounded-xl text-xs md:text-base font-semibold hover:bg-sky-50 transition"
              onClick={() => window.location.href = '/modifier'}
            >
              Modifier
            </button>
          </div>
        </div>

        {/* Vos messages titre hors du cadre gris */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-lg text-gray-800">Vos messages</span>
          <span className="text-gray-400 text-base font-medium">{postCount} publication{postCount > 1 ? 's' : ''}</span>
        </div>

        {/* Messages dynamiques */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl p-6 shadow-inner min-h-[250px] flex flex-col justify-center mb-8">
            {user && user._id ? (
              <FeedList userId={user._id} onPostsChange={posts => setPostCount(posts.length)} />
            ) : (
              <div className="text-red-500">Impossible de récupérer le profil utilisateur</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}