"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "./lib/api";

interface Bien {
  id: number;
  titre: string;
  description: string;
  prix: number;
  localisation: string;
  superficie: number;
  disponible: boolean;
  photos: { id: number; url: string; ordre: number }[];
}

export default function Home() {
  const router = useRouter();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [localisation, setLocalisation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Charger les biens disponibles
  useEffect(() => {
    api.get("/api/biens/disponibles")
      .then((res) => setBiens(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Recherche de biens
  const handleSearch = async () => {
    if (!localisation) return;
    setLoading(true);
    try {
      const prixMax = budget
        ? parseFloat(budget.replace(/[^0-9]/g, ""))
        : 99999999;

      const res = await api.get("/api/biens/recherche", {
        params: {
          localisation,
          prixMin: 0,
          prixMax,
        },
      });
      setBiens(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Newsletter
  const handleSubscribe = () => {
    if (!email) return;
    alert(`Merci ! ${email} a été ajouté à notre liste.`);
    setEmail("");
  };

  return (
    <div className="bg-[#08131F] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-4">

        {/* IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-[#08131F]"></div>

        {/* CONTENT */}
        <div className="relative z-10 mt-20">
          <p className="text-blue-400 mb-2 text-sm">
            IMMOBILIER DE LUXE
          </p>

          <h1 className="text-5xl font-extrabold leading-tight">
            L'Excellence <br />
            <span className="text-blue-400">Immobilière</span>
          </h1>

          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Découvrez une sélection confidentielle de propriétés d'exception.
          </p>

          <div className="flex gap-4 justify-center mt-6">
            <Link href="/login">
              <button className="bg-blue-500 px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600">
                Explorer la collection
              </button>
            </Link>

            <Link href="/register">
              <button className="bg-white/10 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/20">
                Créer un compte
              </button>
            </Link>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="absolute bottom-[-50px] w-full flex justify-center px-4">
          <div className="bg-white text-black rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">

            {/* LOCALISATION */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-gray-500 mb-1">Localisation</p>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1E6FFF" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  placeholder="Où voulez-vous vivre ?"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  className="outline-none w-full text-sm"
                />
              </div>
            </div>

            {/* TYPE */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-gray-500 mb-1">Type de bien</p>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1E6FFF" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                <select className="outline-none w-full text-sm bg-transparent">
                  <option>Villa moderne</option>
                  <option>Appartement</option>
                  <option>Penthouse</option>
                  <option>Chalet</option>
                  <option>Manoir</option>
                  <option>Loft</option>
                </select>
              </div>
            </div>

            {/* BUDGET */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-gray-500 mb-1">Budget max</p>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1E6FFF" strokeWidth="2.5">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="21" y1="10" x2="22" y2="10"/>
                </svg>
                <input
                  type="text"
                  placeholder="Ex: 5,000,000 DH"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="outline-none w-full text-sm"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="p-4 flex items-center">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Rechercher
              </button>
            </div>

          </div>
        </div>

      </section>

      {/* PROPERTIES */}
      <section className="px-10 mt-32">
        <h2 className="text-2xl font-bold mb-6">
          Propriétés à la Une
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 py-10">
            Chargement des propriétés...
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Aucune propriété disponible pour le moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {biens.slice(0, 3).map((bien) => (
              <div
                key={bien.id}
                className="bg-[#0B1C2C] rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition cursor-pointer"
                onClick={() => router.push(`/biens/${bien.id}`)}
              >
                <img
                  src={
                    bien.photos && bien.photos.length > 0
                      ? bien.photos[0].url
                      : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                  }
                  className="h-52 w-full object-cover"
                  alt={bien.titre}
                />
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">VENTE</p>
                  <h3 className="font-bold text-lg">{bien.titre}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    📍 {bien.localisation}
                  </p>
                  <p className="text-gray-400 text-sm">
                    📐 {bien.superficie} m²
                  </p>
                  <p className="text-blue-400 mt-2 font-semibold">
                    {bien.prix.toLocaleString()} DH
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section className="px-10 mt-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold">
              Rejoignez le cercle privilégié
            </h2>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg text-black"
            />
            <button
              onClick={handleSubscribe}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg"
            >
              S'abonner
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}