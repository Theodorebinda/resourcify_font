/**
 * Landing Page - Page d'accueil
 * 
 * Point d'entrée principal de l'application Ressourcefy
 * Route publique - aucune authentification requise
 * 
 * Sections:
 * - Hero: Présentation de l'application et CTA principal
 * - Features: Fonctionnalités principales
 * - How It Works: Processus d'utilisation
 * - CTA: Appel à l'action final
 */

import { HeroSection } from "../../components/landing/hero-section";
import { FeaturesSection } from "../../components/landing/features-section";
import { HowItWorksSection } from "../../components/landing/how-it-works-section";
import { CtaSection } from "../../components/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
  );
}
