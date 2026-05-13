"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { Building, CheckCircle, ArrowRight, Phone, Mail } from "lucide-react";

export default function VendrePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full text-center">
        <span className="text-primary font-semibold text-xs tracking-[0.15em] uppercase mb-3 block">
          Services
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
          Vendez votre bien <span className="text-primary">en toute sérénité</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-10">
          Confiez-nous la vente de votre propriété. Notre équipe d&apos;experts vous accompagne
          à chaque étape pour obtenir le meilleur prix.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <button className="cursor-pointer bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2">
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/login">
            <button className="cursor-pointer bg-surface text-foreground border border-surface-border px-8 py-4 rounded-xl font-semibold hover:bg-muted transition-all">
              J&apos;ai déjà un compte
            </button>
          </Link>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Estimation gratuite", desc: "Obtenez une estimation précise de votre bien par nos experts du marché local." },
            { title: "Visibilité maximale", desc: "Votre propriété sera mise en avant auprès de notre réseau d'acheteurs qualifiés." },
            { title: "Accompagnement complet", desc: "De la mise en vente à la signature, nous gérons tout pour vous." },
          ].map((item) => (
            <div key={item.title} className="bg-surface border border-surface-border rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CheckCircle className="w-8 h-8 text-primary mb-5" />
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="bg-accent text-accent-foreground rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 text-center">
            <Building className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Prêt à vendre votre propriété ?
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 text-sm">
              Contactez-nous pour une estimation gratuite et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+212522456789" className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                <Phone className="w-4 h-4" />
                +212 5 22 45 67 89
              </a>
              <a href="mailto:contact@luximmo.ma" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
                <Mail className="w-4 h-4" />
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
