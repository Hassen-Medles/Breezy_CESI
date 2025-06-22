"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

export default function RegisterProfilForm() {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        username: "",
        description: "",
        profilePicture: null,
    });

    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setForm({ ...form, profilePicture: file });
        setPreview(URL.createObjectURL(file));
        }
    };

     const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("username", form.username);
        formData.append("description", form.description);
        if (form.profilePicture) {
            formData.append("profilePicture", form.profilePicture);
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/profile", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
            setError(data.message || "Une erreur est survenue lors de l'inscription.");
            return;
            }

            router.push("/profil");
        } catch (err) {
            setError("Une erreur est survenue lors de l'inscription.");
        }
    };

    const openFileDialog = () => fileInputRef.current.click();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-2">
            <div
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-300 p-1 cursor-pointer hover:ring-2 hover:ring-sky-400 transition"
              onClick={openFileDialog}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Photo de profil"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle size={64} className="text-sky-300" />
                )}
              </div>
            </div>
            <span
              className="mt-2 text-sky-600 font-medium cursor-pointer hover:underline"
              onClick={openFileDialog}
            >
              {preview ? "Changer la photo" : "Ajouter une photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="username">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={180}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-300"
            />
            <p className="text-xs text-right text-gray-500">
              {form.description.length}/180
            </p>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2 rounded-lg hover:brightness-110 transition"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}