"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Search,
  BookOpen,
  Heart,
  Tag,
  Share2,
  Filter,
  TrendingUp,
  Users,
} from "lucide-react";

/**
 * Features Section
 * 
 * Présente les fonctionnalités principales de Ressourcefy
 * Avec navigation rapide vers chaque fonctionnalité
 */
export function FeaturesSection() {
  const features = [
    {
      id: "recherche",
      icon: Search,
      title: "Recherche avancée",
      description:
        "Trouvez rapidement les ressources qui vous intéressent grâce à notre système de recherche intelligent avec filtres par catégorie, tags et popularité.",
    },
    {
      id: "bibliotheque",
      icon: BookOpen,
      title: "Bibliothèque personnelle",
      description:
        "Organisez vos ressources favorites dans votre bibliothèque personnelle. Accédez-y facilement depuis n'importe où.",
    },
    {
      id: "favoris",
      icon: Heart,
      title: "Système de favoris",
      description:
        "Marquez vos ressources préférées et créez des collections personnalisées pour un accès rapide.",
    },
    {
      id: "tags",
      icon: Tag,
      title: "Tags et catégories",
      description:
        "Organisez et découvrez des ressources grâce à un système de tags flexible et des catégories bien structurées.",
    },
    {
      id: "partage",
      icon: Share2,
      title: "Partage facile",
      description:
        "Partagez vos découvertes avec la communauté en quelques clics. Contribuez à enrichir la base de connaissances.",
    },
    {
      id: "filtres",
      icon: Filter,
      title: "Filtres intelligents",
      description:
        "Affinez vos recherches avec des filtres par type, difficulté, durée et bien plus encore.",
    },
    {
      id: "tendances",
      icon: TrendingUp,
      title: "Tendances",
      description:
        "Découvrez les ressources les plus populaires et tendances du moment pour rester à jour.",
    },
    {
      id: "communaute",
      icon: Users,
      title: "Communauté active",
      description:
        "Rejoignez une communauté passionnée, échangez avec d'autres utilisateurs et partagez vos connaissances.",
    },
  ];

  const scrollToFeature = (featureId: string) => {
    const element = document.getElementById(featureId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="features" className="py-20 md:py-32 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez les fonctionnalités qui font de Ressourcefy la plateforme
              idéale pour partager et découvrir des ressources de qualité.
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {features.map((feature) => (
              <Button
                key={feature.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToFeature(feature.id)}
                className="text-xs"
              >
                {feature.title}
              </Button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  id={feature.id}
                  className="transition-all hover:shadow-lg scroll-mt-20"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
