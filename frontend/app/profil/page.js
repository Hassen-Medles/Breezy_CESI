import { FaUserCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/FooterSwitcher/Footers";
import PostCardList from "../../components/PostCardList";

export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="PROFIL" />
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 mt-5">
        {/* Avatar centré uniquement */}
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-400 p-1 shadow mb-8">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <FaUserCircle size={110} className="text-sky-300" />
            </div>
          </div>
        </div>
        {/* Messages dynamiques */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-lg text-gray-800 mt-2 mb-2">Vos messages</span>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6 shadow-inner">
            <PostCardList />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}