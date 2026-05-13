"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
import FloatingThemeToggle from "../components/FloatingThemeToggle";

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

      const role = response.data.role;
      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "AGENT_COMMERCIAL") router.push("/dashboard/agent-commercial");
      else if (role === "AGENT_SAV") router.push("/dashboard/agent-sav");
      else router.push("/dashboard/client");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { erreur?: string } } };
      setError(axiosErr.response?.data?.erreur || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <FloatingThemeToggle />
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
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
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Bienvenue
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Connectez-vous à votre espace
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <div className="flex items-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  id="login-email"
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
              <label htmlFor="login-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Mot de passe
              </label>
              <div className="flex items-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Votre mot de passe"
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
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}