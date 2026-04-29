import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#08131F] border-t border-white/10 mt-20">
      <div className="max-w-[1400px] mx-auto px-10 py-12">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 w-7 h-7 flex items-center justify-center rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span className="text-sm font-semibold">SupHouse</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Leader mondial de l'immobilier de prestige, nous accompagnons nos clients
              dans l'acquisition, la gestion et la vente de biens d'exception depuis plus de 25 ans.
            </p>

            <div className="flex gap-3 mt-4">
              {["Share", "Instagram", "Twitter"].map((item, i) => (
                <button
                  key={i}
                  className="w-8 h-8 flex items-center justify-center border border-white/10 rounded hover:bg-white/10"
                >
                  •
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a className="hover:text-white">Acheter une propriété</a></li>
              <li><a className="hover:text-white">Vendre votre bien</a></li>
              <li><a className="hover:text-white">Locations saisonnières</a></li>
              <li><a className="hover:text-white">Services de conciergerie</a></li>
              <li><a className="hover:text-white">Nos agences locales</a></li>
            </ul>
          </div>

          {/* Expertise */}
          <div>
            <h4 className="mb-4 font-semibold">Expertise</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a className="hover:text-white">Estimation immobilière</a></li>
              <li><a className="hover:text-white">Investissement locatif</a></li>
              <li><a className="hover:text-white">Gestion de patrimoine</a></li>
              <li><a className="hover:text-white">Rapport annuel du luxe</a></li>
              <li><a className="hover:text-white">Conseils juridiques</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>

            <div className="flex items-start gap-2 mb-3 text-sm text-gray-400">
              <span>✉</span>
              <span>contact@suphouse.com</span>
            </div>

            <div className="flex items-start gap-2 mb-3 text-sm text-gray-400">
              <span>☎</span>
              <span>+33 011 45 67 89 00</span>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-400">
              <span>📍</span>
              <span>
                12 Avenue Montaigne,<br />
                75008 Paris, France
              </span>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="text-center text-gray-500 text-sm mt-10 border-t border-white/10 pt-6">
          © 2026 SupHouse. Tous droits réservés.
        </div>

      </div>
    </footer>
  );
}