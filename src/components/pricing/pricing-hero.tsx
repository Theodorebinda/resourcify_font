"use client";

/**
 * Pricing Hero Section
 * 
 * Section d'introduction pour la page de pricing
 */
export function PricingHero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Tarifs simples et transparents
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Choisissez le plan qui correspond à vos besoins. Tous les plans incluent
            l&apos;accès à notre communauté et à nos ressources de base.
          </p>
        </div>
      </div>
    </section>
  );
}
