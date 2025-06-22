'use client';
import React from "react";
import Navbar from "../../components/Navbar";
import PostForm from "../../components/PostForm";

export default function Accueil() {
  return (
    <>
      <Navbar title="POUR VOUS" />
      <PostForm />
    </>
  );
}