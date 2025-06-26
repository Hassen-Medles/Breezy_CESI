"use client";
import React from "react";
import getProfilePictureUrl from "../getProfilePictureUrl";

export default function MessageRecieved({ content, profilePicture, name }) {
  const [imgSrc, setImgSrc] = React.useState(
    getProfilePictureUrl(profilePicture)
  );
  React.useEffect(() => {
    setImgSrc(getProfilePictureUrl(profilePicture));
  }, [profilePicture]);

  // Affichage comme Friend.js : bulle icône si pas de photo, sinon image
  return (
    <div className="flex items-end mb-2">
      {(!profilePicture || imgSrc === "/defaultimage.png") ? (
        <span className="w-9 h-9 rounded-full mr-2 bg-sky-300 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#38BDF8" />
            <circle cx="12" cy="10" r="4" fill="#fff" />
            <ellipse cx="12" cy="18" rx="6" ry="3" fill="#fff" />
          </svg>
        </span>
      ) : (
        <img
          src={imgSrc}
          alt={name || "avatar"}
          className="w-9 h-9 rounded-full bg-gray-300 mr-2 object-cover border border-gray-300"
          onError={() => setImgSrc("/defaultimage.png")}
        />
      )}
      <div>
        <div className="bg-white rounded-2xl px-4 py-2 text-gray-900 shadow text-base max-w-xs">
          {content}
        </div>
      </div>
    </div>
  );
}