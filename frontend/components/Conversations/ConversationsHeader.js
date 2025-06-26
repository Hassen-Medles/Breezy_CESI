"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function ConversationsHeader({ profilePicture, name }) {
  return (
    <>
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
        <img
          src={profilePicture ? profilePicture : "/defaultimage.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        {/* Infos utilisateur */}
        <div>
          <div className="flex items-center">
            <span className="font-bold text-lg">{name}</span>
          </div>
        </div>
      </div>
    </>
  );
}