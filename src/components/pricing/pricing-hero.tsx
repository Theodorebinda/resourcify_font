"use client";

/**
 * Pricing Hero Section
 * 
 * Section d'introduction pour la page de pricing
 */
export function PricingHero() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tarifs simples et transparents
          </h2>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Choisissez le plan qui correspond à vos besoins. Tous les plans incluent
            l&apos;accès à notre communauté et à nos ressources de base.
          </p>
        </div>
      </div>
    </div>
  );
}
