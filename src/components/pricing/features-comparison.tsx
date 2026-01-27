"use client";

import { Card, CardContent } from "../ui/card";
import { Check, X } from "lucide-react";

/**
 * Features Comparison Section
 * 
 * Tableau de comparaison des fonctionnalités entre les plans
 */
export function FeaturesComparison() {
  const features = [
    {
      feature: "Accès aux ressources publiques",
      free: true,
      premium: true,
      pro: true,
    },
    {
      feature: "Recherche et filtres de base",
      free: true,
      premium: true,
      pro: true,
    },
    {
      feature: "Bibliothèque personnelle",
      free: "50 ressources",
      premium: "Illimitée",
      pro: "Illimitée",
    },
    {
      feature: "Ressources premium",
      free: false,
      premium: true,
      pro: true,
    },
    {
      feature: "Téléchargement en masse",
      free: false,
      premium: true,
      pro: true,
    },
    {
      feature: "Statistiques avancées",
      free: false,
      premium: true,
      pro: true,
    },
    {
      feature: "Gestion d'équipe",
      free: false,
      premium: false,
      pro: "Jusqu'à 10 membres",
    },
    {
      feature: "API access",
      free: false,
      premium: false,
      pro: true,
    },
    {
      feature: "Export de données avancé",
      free: false,
      premium: false,
      pro: true,
    },
    {
      feature: "Support",
      free: "Communautaire",
      premium: "Prioritaire",
      pro: "Dédié",
    },
  ];

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Comparaison des fonctionnalités
          </h2>
          <p className="text-lg text-muted-foreground">
            Comparez les fonctionnalités de chaque plan pour faire le bon choix
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left font-semibold">Fonctionnalité</th>
                    <th className="px-6 py-4 text-center font-semibold">Gratuit</th>
                    <th className="px-6 py-4 text-center font-semibold">Premium</th>
                    <th className="px-6 py-4 text-center font-semibold">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((item, index) => (
                    <tr
                      key={item.feature}
                      className={`border-b ${index % 2 === 0 ? "bg-muted/30" : ""}`}
                    >
                      <td className="px-6 py-4 font-medium">{item.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof item.free === "boolean" ? (
                          item.free ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.free}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof item.premium === "boolean" ? (
                          item.premium ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.premium}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
