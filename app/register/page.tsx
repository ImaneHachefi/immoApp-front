"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";

export default function Register() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/register", {
        nom,
        email,
        motDePasse,
        role: "CLIENT",
      });

      saveAuth(response.data);
      router.push("/dashboard/client");

    } catch (err: any) {
      setError(
        err.response?.data?.erreur || "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#08131F]">

      {/* IMAGE */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        <div className="absolute bottom-10 left-10 text-white max-w-sm">
          <h2 className="text-3xl font-bold">
            Trouvez la demeure de vos rêves
          </h2>
          <p className="text-gray-300 mt-2">
            Accédez à notre catalogue exclusif.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0B1C2C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

          <h2 className="text-3xl font-bold mb-2 text-blue-400">
            Créer un compte
          </h2>

          <p className="text-gray-400 mb-6">
            Commencez votre expérience luxe
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="text-white w-full p-3 mb-4 bg-transparent border border-white/10 rounded-lg focus:border-blue-400"
            />

            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-white w-full p-3 mb-4 bg-transparent border border-white/10 rounded-lg focus:border-blue-400"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="text-white w-full p-3 mb-4 bg-transparent border border-white/10 rounded-lg focus:border-blue-400"
            />

            {/* MESSAGE ERREUR */}
            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-blue-400">
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}