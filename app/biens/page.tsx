"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home as HomeIcon, CreditCard, ChevronRight, SlidersHorizontal } from "lucide-react";
import api from "../lib/api";

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

export default function BiensPage() {
  const router = useRouter();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [localisation, setLocalisation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/biens/disponibles")
      .then((res) => setBiens(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!localisation) return;
    setLoading(true);
    try {
      const prixMax = budget ? parseFloat(budget.replace(/[^0-9]/g, "")) : 99999999;
      const res = await api.get("/api/biens/recherche", {
        params: { localisation, prixMin: 0, prixMax },
      });
      setBiens(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLocalisation("");
    setBudget("");
    setLoading(true);
    api.get("/api/biens/disponibles")
      .then((res) => setBiens(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HEADER */}
      <section className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <span className="text-primary font-semibold text-xs tracking-[0.15em] uppercase mb-3 block">
          Catalogue
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
          Nos Propriétés
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Parcourez notre sélection de biens immobiliers d&apos;exception disponibles à la vente et à la location.
        </p>
      </section>

      {/* SEARCH / FILTERS */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-10">
        <div className="bg-surface border border-surface-border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="search-loc" className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.12em]">
              Localisation
            </label>
            <div className="flex items-center gap-2 bg-background border border-surface-border rounded-lg px-3 py-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <input
                id="search-loc"
                type="text"
                placeholder="Casablanca, Rabat..."
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label htmlFor="search-budget" className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.12em]">
              Budget Max
            </label>
            <div className="flex items-center gap-2 bg-background border border-surface-border rounded-lg px-3 py-2.5">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <input
                id="search-budget"
                type="text"
                placeholder="Ex: 5,000,000 DH"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm hover:brightness-110 transition-all"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
            {(localisation || budget) && (
              <button
                onClick={handleReset}
                className="cursor-pointer bg-muted text-muted-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-border transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full flex-1 mb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Recherche en cours..." : `${biens.length} bien${biens.length > 1 ? "s" : ""} trouvé${biens.length > 1 ? "s" : ""}`}
          </p>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-surface border border-surface-border rounded-2xl h-96" />
            ))}
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center py-24 bg-surface border border-surface-border rounded-2xl">
            <HomeIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">Aucune propriété disponible</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biens.map((bien) => (
              <div
                key={bien.id}
                className="group bg-surface rounded-2xl overflow-hidden border border-surface-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => router.push(`/biens/${bien.id}`)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      bien.photos && bien.photos.length > 0
                        ? bien.photos[0].url
                        : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80"
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={bien.titre}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    En vente
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground line-clamp-1">{bien.titre}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {bien.localisation}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-border">
                    <div className="text-lg font-bold text-primary">
                      {bien.prix.toLocaleString()} <span className="text-sm font-medium">DH</span>
                    </div>
                    <div className="text-muted-foreground text-sm font-medium">
                      {bien.superficie} m²
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
