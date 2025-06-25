import Image from "next/image";
import { Archivo_Black } from "next/font/google";
import { FaEnvelope } from "react-icons/fa";
import Link from "next/link";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

export default function Navbar({ title }) {
  return (
    <header>
      <nav className="fixed top-0 left-0 w-full z-50 max-w-7xl mx-auto flex items-center h-20 relative">
        <div 
          className="w-12 h-12 absolute left-8"
          style={{
            WebkitMaskImage: "url(/wind-solid.svg)",
            maskImage: "url(/wind-solid.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            background: "linear-gradient(90deg, #00AEEF 25%, #12F146 69%)",
            backgroundClip: "border-box",
            display: "inline-block",
          }}
        />

        {/* Texte multicolore */}
        <h1 className="text-2xl font-extrabold flex mx-auto">
          <span
            className={`${archivoBlack.variable} font-archivo-black bg-clip-text text-transparent text-3xl`}
            style={{
              background: "linear-gradient(90deg, #00AEEF 25%, #12F146 69%)",
              WebkitBackgroundClip: "text",
            }}
          >
            {title}
          </span>
        </h1>
        {title !== "PROFIL" && title !== "INSCRIPTION" && title !== "CONNEXION" && (
          <Link
            href="/messages"
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3 hover:bg-blue-100 transition-colors"
            aria-label="Aller aux messages"
          >
            <FaEnvelope className="text-blue-500 w-6 h-6" />
          </Link>
        )}
      </nav>
    </header>
  );
}