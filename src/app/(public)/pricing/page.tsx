/**
 * Pricing Page - Page de tarification
 * 
 * Route publique - aucune authentification requise
 * 
 * Sections:
 * - Hero: Introduction aux tarifs
 * - Pricing Cards: Plans disponibles (Gratuit, Premium, Pro)
 * - Features Comparison: Tableau de comparaison des fonctionnalités
 * - FAQ: Questions fréquentes sur les tarifs
 * - CTA: Appel à l'action final
 */

import { PricingHero } from "../../../components/pricing/pricing-hero";
import { PricingCards } from "../../../components/pricing/pricing-cards";
import { FeaturesComparison } from "../../../components/pricing/features-comparison";
import { PricingFaq } from "../../../components/pricing/pricing-faq";
import { PricingCta } from "../../../components/pricing/pricing-cta";

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <PricingHero />
      <PricingCards />
      <FeaturesComparison />
      <PricingFaq />
      <PricingCta />
    </main>
  );
}
