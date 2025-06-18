"use client";
import { useState } from "react";
import Link from "next/link";
import { FaHome, FaSearch, FaBell, FaUser } from "react-icons/fa";

export function Footer() {
  const [active, setActive] = useState(null);

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white flex justify-around py-4 z-50">
      <Link href="/accueil" className="group">
        <FaHome className="w-8 h-8 text-gray-900 group-hover:text-sky-500 group-active:text-sky-500 transition" />
      </Link>
      <Link href="/recherche" className="group">
        <FaSearch className="w-8 h-8 text-gray-900 group-hover:text-sky-500 group-active:text-sky-500 transition" />
      </Link>
      <Link href="/notification" className="group">
        <FaBell className="w-8 h-8 text-gray-900 group-hover:text-sky-500 group-active:text-sky-500 transition" />
      </Link>
      <Link href="/profil" className="group">
        <FaUser className="w-8 h-8 text-gray-900 group-hover:text-sky-500 group-active:text-sky-500 transition" />
      </Link>
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