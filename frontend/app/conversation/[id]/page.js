'use client'
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "../../../components/Navbar";
import DateSeparator from "../../../components/Conversations/DateSeparator";
import MessageSent from "../../../components/Conversations/MessageSent";
import MessageRecieved from "../../../components/Conversations/MessageRecieved";
import ConversationsHeader from "../../../components/Conversations/ConversationsHeader";
import { FaCamera } from "react-icons/fa";
import { LuImage } from "react-icons/lu";
import { FaRegPaperPlane } from "react-icons/fa";

export default function Conversation() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const fileCameraInputRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
      const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages);
      }
    };
    fetchConversation();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (url) => {
    setPreviews(prev => prev.filter(img => img.url !== url));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        conversationId: id,
        content: message,
        receiver: conversation?.otherUser?._id // à adapter selon ta structure
      })
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      setMessage("");
      setPreviews([]);
    } else {
      alert("Erreur lors de l'envoi du message");
    }
  };

  return (
    <>
      <Navbar title="CONVERSATION" />
      <ConversationsHeader name={conversation?.otherUser?.username || "Utilisateur"} profilePicture={conversation?.otherUser?.profilePicture} />
      {/* Ajout d'un margin-top pour éviter la collision avec la navbar */}
      <div className="flex flex-col flex-1 px-2 overflow-y-auto bg-gray-50 mt-8" style={{ minHeight: "80vh" }}>
        {messages.map(msg =>
          msg.sender === conversation?.me ? (
            <MessageSent key={msg._id} content={msg.content} />
          ) : (
            <MessageRecieved key={msg._id} content={msg.content} profilePicture={conversation?.otherUser?.profilePicture} />
          )
        )}
      </div>
      {/* Barre d'envoi de message */}
      <form
        className="fixed flex-col left-0 right-0 bottom-16 w-full flex bg-white px-4 py-2 border-t border-gray-200 z-40"
        onSubmit={handleSendMessage}
      >
        {/* Preview images row */}
        {previews.length > 0 && (
          <div className="flex flex-row gap-3 items-center mb-2">
            {previews.map((img, idx) => (
              <div key={img.url} className="relative bg-white rounded-xl shadow border border-gray-200 flex items-center justify-center" style={{ width: 80, height: 80 }}>
                <img
                  src={img.url}
                  alt={img.name}
                  className="object-cover w-full h-full rounded-xl"
                />
                <button
                  onClick={() => handleRemoveImage(img.url)}
                  type="button"
                  className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-100 transition cursor-pointer"
                >
                  <span className="text-red-500 text-base font-bold">×</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message input row */}
        <div className="flex items-center">
          <button type="button" className="mr-2 text-green-500 text-2xl cursor-pointer" onClick={() => fileCameraInputRef.current.click()}>
            <FaCamera className="w-6 h-6" />
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileCameraInputRef}
            onChange={handleImageChange}
          />
          <input
            type="text"
            placeholder="Votre message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button type="submit" className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer">
            <FaRegPaperPlane className="w-5 h-5" />
          </button>
          <label className="ml-2 text-gray-500 text-2xl cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <LuImage className="w-6 h-6" />
          </label>
        </div>
      </form>
    </>
  );
}