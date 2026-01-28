"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ThemeSelector } from "./theme-selector";
import { ROUTES } from "../../constants/routes";
import { BookOpen, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

/**
 * Composant de navigation partagé
 * Utilisé par les deux headers (normal et overlay)
 */
function NavigationContent() {
  const navLinks = [
    { href: ROUTES.HOME, label: "Accueil" },
    { href: ROUTES.FEATURES, label: "Fonctionnalités" },
    { href: ROUTES.PRICING, label: "Tarif" },
    { href: ROUTES.BLOG, label: "Blog" },
    { href: ROUTES.CONTACT, label: "Contact" },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Ressourcefy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ThemeSelector />
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={ROUTES.AUTH.LOGIN}>Se connecter</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.AUTH.REGISTER}>S&apos;inscrire</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigation et actions rapides
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={ROUTES.AUTH.LOGIN}>Se connecter</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href={ROUTES.AUTH.REGISTER}>S&apos;inscrire</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

/**
 * Public Header Component
 * 
 * Deux headers :
 * 1. Header normal qui scroll avec le contenu (flux normal)
 * 2. Header fixe (overlay) qui apparaît après 400px de scroll
 */
export function PublicHeader() {
  const [showOverlayHeader, setShowOverlayHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowOverlayHeader(scrollY > 600);
    };

    // Écouter le scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Vérifier la position initiale
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className="relative z-40 w-full bg-background ">
        <NavigationContent />
      </header>
      <AnimatePresence>
        {showOverlayHeader && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/60 border-b shadow-sm"
          >
            <NavigationContent />
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}
