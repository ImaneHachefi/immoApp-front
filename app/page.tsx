"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home as HomeIcon, CreditCard, ChevronRight } from "lucide-react";
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

  const handleSubscribe = () => {
    if (!email) return;
    alert(`Merci ! ${email} a été ajouté à notre liste.`);
    setEmail("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
      <Navbar />

      {/* ========== HERO + SEARCH WRAPPER ========== */}
      {/* No overflow-hidden here so the search bar is never clipped */}
      <div className="relative">

        {/* HERO SECTION */}
        <section className="relative h-[85vh] min-h-[600px] flex flex-col justify-center items-center text-center px-4 pt-16 overflow-hidden">
          {/* BACKGROUND IMAGE */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
              alt="Luxury Villa Background"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs sm:text-sm mb-5">
              Immobilier d&apos;Exception
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] text-white mb-6">
              L&apos;Excellence <br className="hidden sm:block" />
              <span className="text-primary">Immobilière</span>
            </h1>

            <p className="text-white/75 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Découvrez une sélection confidentielle de propriétés de prestige.
              Vivez l&apos;expérience d&apos;un luxe sans compromis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto cursor-pointer bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  Explorer la collection
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto cursor-pointer bg-white/10 text-white backdrop-blur-md px-8 py-4 rounded-xl border border-white/25 font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all text-sm sm:text-base">
                  Créer un compte
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* SEARCH BAR — positioned OUTSIDE the hero overflow context */}
        <div className="relative z-20 w-full flex justify-center px-4 -mt-12 sm:-mt-14">
          <div className="bg-surface text-foreground rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-surface-border flex flex-col md:flex-row w-full max-w-5xl">

            {/* LOCALISATION */}
            <div className="flex-1 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-surface-border hover:bg-muted/40 transition-colors rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.12em]">Localisation</label>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Où voulez-vous vivre ?"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  className="outline-none w-full bg-transparent text-sm sm:text-base font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* TYPE */}
            <div className="flex-1 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-surface-border hover:bg-muted/40 transition-colors">
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.12em]">Type de bien</label>
              <div className="flex items-center gap-2.5">
                <HomeIcon className="w-5 h-5 text-primary shrink-0" />
                <select className="outline-none w-full bg-transparent text-sm sm:text-base font-medium cursor-pointer appearance-none">
                  <option>Villa moderne</option>
                  <option>Appartement</option>
                  <option>Penthouse</option>
                  <option>Domaine viticole</option>
                  <option>Manoir</option>
                </select>
              </div>
            </div>

            {/* BUDGET */}
            <div className="flex-1 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-surface-border hover:bg-muted/40 transition-colors">
              <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.12em]">Budget Max</label>
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Ex: 5,000,000 DH"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="outline-none w-full bg-transparent text-sm sm:text-base font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <div className="p-4 sm:p-5 flex items-end justify-center rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto cursor-pointer bg-primary text-primary-foreground px-7 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-primary/20"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROPERTIES SECTION ========== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-20 sm:mt-28 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Propriétés Exclusives
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Découvrez nos biens les plus convoités</p>
          </div>
          <Link href="/biens" className="text-primary font-semibold hover:underline flex items-center gap-1 group text-sm">
            Voir tout le catalogue
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface border border-surface-border rounded-2xl h-96"></div>
            ))}
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 bg-surface border border-surface-border rounded-2xl">
            Aucune propriété disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {biens.slice(0, 3).map((bien) => (
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
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg sm:text-xl mb-2 text-foreground line-clamp-1">{bien.titre}</h3>
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

      {/* ========== NEWSLETTER ========== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="bg-accent text-accent-foreground rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              Rejoignez le Cercle Privilégié
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Recevez en avant-première nos nouvelles propriétés d&apos;exception et les tendances du marché immobilier de luxe.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-80 transition-all text-white placeholder:text-white/50"
            />
            <button
              onClick={handleSubscribe}
              className="cursor-pointer bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:brightness-110 transition-all shadow-md shrink-0 text-sm"
            >
              S&apos;inscrire
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}