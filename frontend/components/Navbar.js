import Image from "next/image";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

export default function Navbar() {
  return (
    <header>
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3 h-20">
      <div
        className="w-10 h-10"
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
      <h1 className="text-2xl font-extrabold flex">
<span
  className={`${archivoBlack.variable} font-archivo-black bg-clip-text text-transparent text-3xl`}
  style={{
    background: "linear-gradient(90deg, #00AEEF 25%, #12F146 69%)",
    WebkitBackgroundClip: "text", // <-- Ajoute cette ligne !
  }}
>
  CONNEXION
</span>
      </h1>
      </div>
    </header>
  );
}