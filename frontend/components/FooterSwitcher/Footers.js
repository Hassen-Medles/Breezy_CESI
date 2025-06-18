"use client";
import { useState } from "react";
import { FaHome, FaSearch, FaBell, FaUser } from "react-icons/fa";

export function Footer() {
  const [active, setActive] = useState(null);

  return (
    <footer className=" bottom-0 left-0 w-screen bg-white border-t border-gray-200 flex justify-around items-center py-2 z-[100]">
      {[FaHome, FaSearch, FaBell, FaUser].map((Icon, idx) => (
        <button
          key={idx}
          onClick={() => setActive(idx)}
          className={`bg-none border-none cursor-pointer text-2xl p-2 flex-1 transition-colors duration-200 touch-manipulation ${
            active === idx ? "text-cyan-500" : "text-gray-900"
          }`}
          aria-label={`icon-${idx}`}
          type="button"
        >
          <Icon />
        </button>
      ))}
    </footer>
  );
}

export function FooterSimple() {
  return (
    <footer className="w-screen text-center py-4 bg-white z-[100]">
      © 2025 Breezy CESI
    </footer>
  );
}