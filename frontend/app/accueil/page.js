'use client';
import React, { useRef } from "react";
import Navbar from "../../components/Navbar";
import PostForm from "../../components/PostForm";
import FeedList from "../../components/feedlist";

export default function Accueil() {
  const feedListRef = useRef();

  const handlePostCreated = () => {
    if (feedListRef.current) {
      feedListRef.current.refreshPosts();
    }
  };

  return (
    <>
      <PostForm onPostCreated={handlePostCreated} />
      <FeedList ref={feedListRef} />  
    </>
  );
}