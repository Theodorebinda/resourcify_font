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
 * - Pricing: Section tarification (intégrée dans l'accueil)
 * - CTA: Appel à l'action final
 */

import { HeroSection } from "../../components/landing/hero-section";
import { FeaturesSection } from "../../components/landing/features-section";
import { HowItWorksSection } from "../../components/landing/how-it-works-section";
import { PricingHero } from "../../components/pricing/pricing-hero";
import { PricingCards } from "../../components/pricing/pricing-cards";
import { FeaturesComparison } from "../../components/pricing/features-comparison";
import { PricingFaq } from "../../components/pricing/pricing-faq";
import { CtaSection } from "../../components/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      
      {/* Pricing Section - Intégrée dans l'accueil */}
      <section id="pricing" className="scroll-mt-20">
        <PricingHero />
        <PricingCards />
        <FeaturesComparison />
        <PricingFaq />
      </section>
      
      <CtaSection />
    </main>
  );
}
