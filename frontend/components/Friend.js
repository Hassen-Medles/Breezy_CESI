"use client";
import React, { useState } from "react";

export default function Friends({name, content, messageread, time}) {

  const isread = (e) => {
        if (messageread) {
            return (
                
                <div className="text-xs text-gray-400">Vu il y a {time}</div>
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
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                <div className="flex-1 flex justify-between items-center">
                    <div>
                        <div className="text-base">{name}</div>
                        {isread()}
                    </div>
                    {!messageread && (
                        <span className="ml-3 w-2 h-2 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"></span>
                    )}
                </div>
            </li>
        </>
    );

}