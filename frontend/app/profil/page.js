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
                  <FaUserCircle size={110} className="text-sky-300" />
                </div>
              </div>
            </div>
            <div className="flex gap-6 justify-center md:justify-start mt-12">
              <button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-2 px-7 rounded-xl font-semibold hover:brightness-110 transition">
                Modifier
              </button>
              <button className="bg-gray-200 text-gray-600 py-2 px-7 rounded-xl font-semibold hover:bg-gray-300">
                Paramètre
              </button>
            </div>
          </div>
          {/* Infos centrées */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-gray-800">Ton Pseudo</h1>
            <div className="flex gap-10 mt-3 justify-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">345</p>
                <p className="text-sm text-gray-500">Abonnement</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">345</p>
                <p className="text-sm text-gray-500">Suivie</p>
              </div>
            </div>
            <div className="md:w-[385px] mt-7">
              <p className="text-base text-gray-600 text-justify break-words">
                Une courte description sympa ou ta bio ici. Une courte description sympa ou ta bio ici.
              </p>
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
        {/* Bulles */}
        <div className="flex justify-between mt-10 px-4 md:px-16">
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