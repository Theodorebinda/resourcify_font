"use client";

import Link from "next/link";
import { ROUTES } from "../../constants/routes";
import { BookOpen, Github, Twitter, Linkedin, Mail } from "lucide-react";

/**
 * Public Footer Component
 * 
 * Footer moderne pour les pages publiques
 * Inclut les liens importants, les réseaux sociaux et les informations légales
 */
export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produit: [
      { href: ROUTES.HOME, label: "Accueil" },
      { href: ROUTES.BLOG, label: "Blog" },
      { href: ROUTES.PRICING, label: "Tarifs" },
      { href: ROUTES.CONTACT, label: "Contact" },
    ],
    ressources: [
      { href: "#", label: "Documentation" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Guides" },
      { href: "#", label: "FAQ" },
    ],
    légal: [
      { href: "#", label: "Mentions légales" },
      { href: "#", label: "Politique de confidentialité" },
      { href: "#", label: "Conditions d'utilisation" },
      { href: "#", label: "CGV" },
    ],
  };

  const socialLinks = [
    { href: "#", icon: Github, label: "GitHub" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: `mailto:contact@ressourcefy.com`, icon: Mail, label: "Email" },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Ressourcefy</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Votre plateforme pour partager et découvrir des ressources de qualité.
              Rejoignez une communauté passionnée par l&apos;apprentissage.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.produit.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2">
              {footerLinks.ressources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.légal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Ressourcefy. Tous droits réservés.
            </p>
            <p className="text-sm text-muted-foreground">
              Fait avec ❤️ pour la communauté
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
