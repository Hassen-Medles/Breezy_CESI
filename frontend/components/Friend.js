"use client";
import React from "react";
import getProfilePictureUrl from "./getProfilePictureUrl";

export default function Friend({name, content, messageread, time, photo, isUnreadFromFriend}) {

  const isread = () => {
        if (messageread) {
            return (
                <div className="text-xs text-gray-400">{time}</div>
            );
        } else {
            return (
                <div className="text-sm text-black text-lg font-semibold">
                    {content.length > 15 ? content.slice(0, 15) + '...' : content}
                </div>
            );
        }
  }

  return (
        <>
            <li className="flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer">
                {photo ? (
                  <img
                    src={getProfilePictureUrl(photo)}
                    alt={name}
                    className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-300"
                    onError={e => { e.target.onerror = null; e.target.src = '/defaultimage.png'; e.target.className = 'w-10 h-10 rounded-full mr-3 bg-sky-300 object-cover'; }}
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full mr-3 bg-sky-300 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#38BDF8"/>
                      <circle cx="12" cy="10" r="4" fill="#fff"/>
                      <ellipse cx="12" cy="18" rx="6" ry="3" fill="#fff"/>
                    </svg>
                  </span>
                )}
                <div className="flex-1 flex justify-between items-center">
                    <div>
                        <div className="text-base">{name}</div>
                        {isread()}
                    </div>
                    {isUnreadFromFriend && (
                        <span className="ml-3 w-2 h-2 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"></span>
                    )}
                </div>
            </li>
        </>
    );

}