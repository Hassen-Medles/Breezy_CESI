"use client";
import React, { useState } from "react";

export default function MessageSent({content}) {

  return (
        <>
            <div className="flex justify-end mb-2">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-2xl px-4 py-2 shadow text-base max-w-xs">
                    {content}
                </div>
            </div>
        </>
    );
}