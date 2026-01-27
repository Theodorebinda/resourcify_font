"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { UserPlus, BookOpen, Heart, Share2 } from "lucide-react";

/**
 * How It Works Section
 * 
 * Explique comment utiliser Ressourcefy en quelques étapes simples
 */
export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Créez votre compte",
      description:
        "Inscrivez-vous gratuitement en quelques secondes. Personnalisez votre profil et vos intérêts pour une expérience sur mesure.",
    },
    {
      step: "02",
      icon: BookOpen,
      title: "Explorez les ressources",
      description:
        "Parcourez notre vaste collection de ressources organisées par catégories. Utilisez la recherche et les filtres pour trouver exactement ce que vous cherchez.",
    },
    {
      step: "03",
      icon: Heart,
      title: "Sauvegardez vos favoris",
      description:
        "Marquez vos ressources préférées et organisez-les dans votre bibliothèque personnelle pour y accéder facilement plus tard.",
    },
    {
      step: "04",
      icon: Share2,
      title: "Partagez avec la communauté",
      description:
        "Contribuez à la communauté en partageant vos propres découvertes. Aidez les autres à trouver des ressources de qualité.",
    },
  ];

  return (
    <section className="bg-muted/50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Comment ça fonctionne
          </h2>
          <p className="text-lg text-muted-foreground">
            Commencez à utiliser Ressourcefy en quelques étapes simples
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                {/* Connector line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-border lg:block" />
                )}
                <Card className="relative h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-2xl font-bold text-muted-foreground">
                        {step.step}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
