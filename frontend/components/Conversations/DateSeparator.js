"use client";
import React, { useState } from "react";

export default function Friends({time}) {

  return (
        <>
            <div className="flex justify-center my-4">
                <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                {time}
                </span>
            </div>
        </>
    );
}