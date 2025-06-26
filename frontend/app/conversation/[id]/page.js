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
  const messagesEndRef = useRef(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file: file
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (url) => {
    setPreviews(prev => prev.filter(img => img.url !== url));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && previews.length === 0) return;

    const formData = new FormData();
    formData.append("conversationId", id);
    formData.append("content", message);
    formData.append("receiver", conversation?.otherUser?._id);
    if (previews.length > 0) {
      // On n'envoie que la première image (pour multi-image, adapter le backend)
      formData.append("image", previews[0].file);
    }

    const res = await fetch("http://localhost:5001/api/messages", {
      method: "POST",
      credentials: "include",
      body: formData,
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
      {/* Ajout d'un margin-bottom pour ne pas cacher les messages par l'input */}
      <div
        className="flex flex-col flex-1 px-2 overflow-y-auto bg-gray-50 mt-8"
        style={{ minHeight: "80vh", marginBottom: "110px" }}
      >
        {messages.map(msg =>
          msg.sender === conversation?.me ? (
            <div key={msg._id} className="flex flex-col items-end mb-2">
              <MessageSent content={msg.content} />
              {msg.image && (
                <img
                  src={`http://localhost:5001/uploads/${msg.image}`}
                  alt="Image envoyée"
                  style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginTop: 8 }}
                  className="self-end"
                />
              )}
            </div>
          ) : (
            <div key={msg._id} className="flex flex-col items-start mb-2">
              <MessageRecieved content={msg.content} profilePicture={conversation?.otherUser?.profilePicture} />
              {msg.image && (
                <img
                  src={`http://localhost:5001/uploads/${msg.image}`}
                  alt="Image envoyée"
                  style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginTop: 8 }}
                  className="self-start"
                />
              )}
            </div>
          )
        )}
        <div ref={messagesEndRef} />
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