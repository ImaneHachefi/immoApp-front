"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Mail, Lock, UserPlus, Loader2 } from "lucide-react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
import FloatingThemeToggle from "../components/FloatingThemeToggle";

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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { erreur?: string } } };
      setError(axiosErr.response?.data?.erreur || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <FloatingThemeToggle />
      {/* LEFT — Image panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end p-10">
        <img
          src="/hero-bg.png"
          alt="Propriété de luxe"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            Trouvez la demeure de vos rêves
          </h2>
          <p className="text-white/60 text-base">
            Accédez à notre catalogue exclusif de propriétés d&apos;exception.
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-10 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Building className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground tracking-tight">
              LuxImmo
            </span>
          </Link>

          {/* Card */}
          <div className="bg-surface border border-surface-border rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Créer un compte
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Commencez votre expérience luxe
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label htmlFor="register-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Nom complet
                </label>
                <div className="flex items-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Prénom Nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    id="register-email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Mot de passe
                </label>
                <div className="flex items-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm px-4 py-3 rounded-xl text-center font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/20 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}