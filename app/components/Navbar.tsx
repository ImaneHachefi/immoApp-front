"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Building } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { label: "Acheter", href: "/biens" },
  { label: "Louer", href: "/biens" },
  { label: "Vendre", href: "/vendre" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const effectiveScrolled = !isHome || scrolled;

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300",
        effectiveScrolled
          ? "bg-surface/90 border-b border-surface-border backdrop-blur-xl shadow-lg"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-primary/20">
            <Building className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <span className={clsx(
            "font-display text-xl font-bold tracking-tight transition-colors duration-300",
            effectiveScrolled ? "text-foreground" : "text-white"
          )}>
            LuxImmo
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors duration-200 relative",
                "after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                effectiveScrolled
                  ? "text-foreground/70 hover:text-foreground"
                  : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP ACTIONS — only theme toggle + login */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle scrolled={effectiveScrolled} />
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-md shadow-primary/20 hover:shadow-primary/40"
          >
            Se connecter
          </Link>
        </div>

        {/* MOBILE: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle scrolled={effectiveScrolled} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              effectiveScrolled
                ? "text-foreground hover:bg-muted"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={clsx(
          "absolute top-16 left-0 right-0 bg-surface border-b border-surface-border shadow-xl md:hidden transition-all duration-300 origin-top",
          mobileMenuOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <div className="p-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground hover:text-primary px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-surface-border my-3" />
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-primary text-primary-foreground text-center px-5 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ThemeToggle({ scrolled }: { scrolled: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={clsx(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0",
        scrolled
          ? "text-foreground/70 hover:text-foreground hover:bg-muted"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
      aria-label="Changer le thème"
    >
      {resolvedTheme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}