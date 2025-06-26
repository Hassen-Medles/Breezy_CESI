"use client";
import Link from "next/link";
import React from "react";
import getProfilePictureUrl from '../getProfilePictureUrl';

export default function ConversationsHeader({ profilePicture, name, isOnline }) {
  const profileUrl = getProfilePictureUrl(profilePicture);
  const showDefault = !profilePicture || profileUrl === '/defaultimage.png';
  return (
    <div className="flex items-center px-4 py-2 bg-white border-b border-gray-100">
      {/* Flèche retour */}
      <Link href="/messages" className="group">
        <button className="mr-2 text-2xl text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </Link>
      {/* Avatar */}
      {showDefault ? (
        <span className="w-10 h-10 rounded-full mr-3 bg-sky-300 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#38BDF8"/>
            <circle cx="12" cy="10" r="4" fill="#fff"/>
            <ellipse cx="12" cy="18" rx="6" ry="3" fill="#fff"/>
          </svg>
        </span>
      ) : (
        <img
          src={profileUrl}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
          onError={e => { e.target.onerror = null; e.target.src = '/defaultimage.png'; e.target.className = 'w-10 h-10 rounded-full mr-3 bg-sky-300 object-cover'; }}
        />
      )}
      {/* Infos utilisateur */}
      <div>
        <div className="flex items-center">
          <span className="font-bold text-lg">{name}</span>
        </div>
        {/* ...autres infos... */}
      </div>
    </div>
  );
}