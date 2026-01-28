"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ROUTES } from "../../constants/routes";
import { Check, X } from "lucide-react";

/**
 * Pricing Cards Section
 * 
 * Affiche les différents plans tarifaires disponibles
 */
export function PricingCards() {
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      period: "toujours",
      description: "Parfait pour commencer et explorer les ressources",
      badge: null,
      features: [
        "Accès à toutes les ressources publiques",
        "Recherche et filtres de base",
        "Bibliothèque personnelle (jusqu'à 50 ressources)",
        "Partage de ressources",
        "Support communautaire",
      ],
      limitations: [
        "Pas de ressources premium",
        "Pas de téléchargement en masse",
      ],
      cta: "Commencer gratuitement",
      ctaVariant: "outline" as const,
      href: ROUTES.AUTH.REGISTER,
    },
    {
      name: "Premium",
      price: "2",
      period: "mois",
      description: "Pour les utilisateurs actifs qui veulent plus",
      badge: "Populaire",
      features: [
        "Tout du plan Gratuit",
        "Accès aux ressources premium",
        "Bibliothèque illimitée",
        "Téléchargement en masse",
        "Statistiques avancées",
        "Support prioritaire",
        "Accès anticipé aux nouvelles fonctionnalités",
      ],
      limitations: [],
      cta: "Essayer Premium",
      ctaVariant: "default" as const,
      href: ROUTES.AUTH.REGISTER,
    },
    {
      name: "Pro",
      price: "12",
      period: "mois",
      description: "Pour les professionnels et équipes",
      badge: null,
      features: [
        "Tout du plan Premium",
        "Gestion d'équipe (jusqu'à 10 membres)",
        "API access",
        "Export de données avancé",
        "Personnalisation de l'interface",
        "Support dédié",
        "Formation personnalisée",
      ],
      limitations: [],
      cta: "Contacter les ventes",
      ctaVariant: "outline" as const,
      href: ROUTES.CONTACT,
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all hover:shadow-lg ${
                plan.badge === "Populaire"
                  ? "border-primary shadow-lg scale-105"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  {plan.period && (
                    <span className="text-muted-foreground"> / {plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                      <X className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button asChild variant={plan.ctaVariant} className="w-full" size="lg">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
