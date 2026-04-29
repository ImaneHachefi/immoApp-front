"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        email,
        motDePasse,
      });

      saveAuth(response.data);

      // Redirection selon le rôle
      const role = response.data.role;
      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "AGENT_COMMERCIAL") router.push("/dashboard/agent-commercial");
      else if (role === "AGENT_SAV") router.push("/dashboard/agent-sav");
      else router.push("/dashboard/client");

    } catch (err: any) {
      setError(
        err.response?.data?.erreur || "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#08131F]">

      {/* IMAGE BACKGROUND */}
      <img
        src="https://images.unsplash.com/photo-1493809842364-78817add7ffb"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-[#08131F]"></div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-[#0B1C2C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        <h2 className="text-3xl font-bold text-blue-400 text-center mb-2">
          Bienvenue
        </h2>

        <p className="text-center text-gray-400 mb-6">
          Connectez-vous à votre espace
        </p>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-white w-full p-3 mb-4 bg-transparent border border-white/10 rounded-lg focus:outline-none focus:border-blue-400"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            className="text-white w-full p-3 mb-4 bg-transparent border border-white/10 rounded-lg focus:outline-none focus:border-blue-400"
          />

          {/* MESSAGE ERREUR */}
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </form>

        {/* LINKS */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
}