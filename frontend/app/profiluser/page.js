"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/FooterSwitcher/Footers";

export default function ProfilUserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      })
      .catch(() => {
        router.push("/recherche");
      });
  }, [userId, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="PROFIL" />
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 mt-5">
        <div className="flex flex-col md:flex-row items-start md:gap-0 gap-6">
          <div className="flex-1 flex flex-col items-center md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto md:ml-16">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-400 p-1 shadow">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  {user && user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Photo de profil"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FaUserCircle size={110} className="text-sky-300" />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Infos centrées */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {user ? user.username : "Pseudos"}
            </h1>
            <div className="flex gap-10 mt-3 justify-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{user?.followers?.length ?? 0}</p>
                <p className="text-sm text-gray-500">Abonnés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{user?.following?.length ?? 0}</p>
                <p className="text-sm text-gray-500">Suivis</p>
              </div>
            </div>
            <div className="md:w-[385px] mt-7">
              <p className="text-base text-gray-600 text-justify break-words">
                {user ? user.description : "Description"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
