"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import Link from "next/link";
import { Search, MapPin, CreditCard, Building, MessageSquare, RotateCcw } from "lucide-react";

interface Bien {
  id: number;
  titre: string;
  description: string;
  prix: number;
  disponible: boolean;
  localisation: string;
  superficie: number;
  photos: { url: string }[];
}

export default function ClientCatalogue() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [localisation, setLocalisation] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get("/api/biens/disponibles")
      .then((r) => setBiens(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!localisation) return;
    setLoading(true);
    try {
      const res = await api.get("/api/biens/recherche", {
        params: { localisation, prixMin: 0, prixMax: prixMax ? parseFloat(prixMax) : 99999999 },
      });
      setBiens(res.data);
      setSearched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLocalisation("");
    setPrixMax("");
    setSearched(false);
    setLoading(true);
    api.get("/api/biens/disponibles")
      .then((r) => setBiens(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const getPhoto = (b: Bien) =>
    b.photos?.length > 0 && b.photos[0]?.url
      ? b.photos[0].url
      : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80";

  return (
    <ProtectedRoute allowedRoles={["CLIENT", "ADMIN"]}>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">LuxImmo</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">Propriétés à la Une</h1>
          <p className="text-muted-foreground text-sm mt-2">{biens.length} propriété{biens.length > 1 ? "s" : ""} disponible{biens.length > 1 ? "s" : ""}</p>
        </div>

        {/* Search bar */}
        <div className="bg-surface border border-surface-border rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="client-loc" className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Localisation</label>
            <div className="flex items-center gap-2 bg-background border border-surface-border rounded-lg px-3 py-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <input
                id="client-loc"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Casablanca, Rabat..."
                className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="client-budget" className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Budget max (DH)</label>
            <div className="flex items-center gap-2 bg-background border border-surface-border rounded-lg px-3 py-2.5">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <input
                id="client-budget"
                value={prixMax}
                onChange={(e) => setPrixMax(e.target.value)}
                placeholder="Ex: 2000000"
                className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="cursor-pointer px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
            {searched && (
              <button onClick={reset} className="cursor-pointer px-4 py-2.5 bg-muted text-muted-foreground border border-surface-border rounded-lg text-sm font-medium hover:bg-surface-border transition-colors flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Chatbot shortcut */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Laissez notre IA vous guider
            </div>
            <div className="text-xs text-muted-foreground">
              Notre chatbot analyse vos préférences et vous recommande les meilleures propriétés.
            </div>
          </div>
          <Link href="/dashboard/client/chatbot">
            <button className="cursor-pointer px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-semibold hover:bg-primary/20 transition-colors whitespace-nowrap">
              Démarrer le chatbot
            </button>
          </Link>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface border border-surface-border rounded-xl h-96" />
            ))}
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-surface-border rounded-xl">
            <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aucune propriété disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {biens.map((b) => (
              <div
                key={b.id}
                className="group bg-surface rounded-xl overflow-hidden border border-surface-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={getPhoto(b)}
                    alt={b.titre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Vente
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-semibold text-lg mb-1 text-foreground line-clamp-1">{b.titre}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {b.localisation}</span>
                    <span>{b.superficie} m²</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-border">
                    <div className="font-display text-xl font-semibold text-primary">
                      {b.prix?.toLocaleString()} <span className="text-sm">DH</span>
                    </div>
                    <button className="cursor-pointer px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}