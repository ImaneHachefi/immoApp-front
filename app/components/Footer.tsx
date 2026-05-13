import { Building, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0 w-max">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Building className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground tracking-tight">
                LuxImmo
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Leader de l&apos;immobilier de prestige au Maroc, nous accompagnons nos clients
              dans l&apos;acquisition et la vente de biens d&apos;exception à Casablanca, Rabat, Marrakech et Tanger.
            </p>

            <div className="flex gap-3">
              <button className="w-10 h-10 flex items-center justify-center border border-surface-border rounded-lg hover:bg-muted hover:text-primary transition-colors text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-surface-border rounded-lg hover:bg-muted hover:text-primary transition-colors text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-surface-border rounded-lg hover:bg-muted hover:text-primary transition-colors text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/biens?type=achat" className="hover:text-primary transition-colors">Acheter une propriété</Link></li>
              <li><Link href="/vendre" className="hover:text-primary transition-colors">Vendre votre bien</Link></li>
              <li><Link href="/biens?type=location" className="hover:text-primary transition-colors">Locations saisonnières</Link></li>
              <li><Link href="/conciergerie" className="hover:text-primary transition-colors">Services de conciergerie</Link></li>
              <li><Link href="/agences" className="hover:text-primary transition-colors">Nos agences locales</Link></li>
            </ul>
          </div>

          {/* Expertise */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Expertise</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/services/estimation" className="hover:text-primary transition-colors">Estimation immobilière</Link></li>
              <li><Link href="/services/investissement" className="hover:text-primary transition-colors">Investissement locatif</Link></li>
              <li><Link href="/services/gestion" className="hover:text-primary transition-colors">Gestion de patrimoine</Link></li>
              <li><Link href="/rapport-annuel" className="hover:text-primary transition-colors">Rapport annuel du luxe</Link></li>
              <li><Link href="/services/juridique" className="hover:text-primary transition-colors">Conseils juridiques</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Contact</h4>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              <a href="mailto:contact@luximmo.ma" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>contact@luximmo.ma</span>
              </a>
              <a href="tel:+212522456789" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+212 5 22 45 67 89</span>
              </a>
              <div className="flex items-start gap-3 mt-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Boulevard Anfa, Twin Center,<br />
                  20100 Casablanca, Maroc
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-surface-border mt-16 pt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LuxImmo. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}