"use client";
import React, { useState } from "react";

export default function MessageRecieved({content, profilePicture}) {

  return (
        <>
            <div className="flex items-end mb-2">
                <img
                src={profilePicture || "https://via.placeholder.com/150"}
                alt="avatar"
                className="w-9 h-9 rounded-full bg-gray-300 mr-2"
                />
                <div>
                <div className="bg-white rounded-2xl px-4 py-2 text-gray-900 shadow text-base max-w-xs">
                    {content}
                </div>
                </div>
            </div>
        </>
    );
}