"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
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
 */
export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Recherche avancée",
      description:
        "Trouvez rapidement les ressources qui vous intéressent grâce à notre système de recherche intelligent avec filtres par catégorie, tags et popularité.",
    },
    {
      icon: BookOpen,
      title: "Bibliothèque personnelle",
      description:
        "Organisez vos ressources favorites dans votre bibliothèque personnelle. Accédez-y facilement depuis n'importe où.",
    },
    {
      icon: Heart,
      title: "Système de favoris",
      description:
        "Marquez vos ressources préférées et créez des collections personnalisées pour un accès rapide.",
    },
    {
      icon: Tag,
      title: "Tags et catégories",
      description:
        "Organisez et découvrez des ressources grâce à un système de tags flexible et des catégories bien structurées.",
    },
    {
      icon: Share2,
      title: "Partage facile",
      description:
        "Partagez vos découvertes avec la communauté en quelques clics. Contribuez à enrichir la base de connaissances.",
    },
    {
      icon: Filter,
      title: "Filtres intelligents",
      description:
        "Affinez vos recherches avec des filtres par type, difficulté, durée et bien plus encore.",
    },
    {
      icon: TrendingUp,
      title: "Tendances",
      description:
        "Découvrez les ressources les plus populaires et tendances du moment pour rester à jour.",
    },
    {
      icon: Users,
      title: "Communauté active",
      description:
        "Rejoignez une communauté passionnée, échangez avec d'autres utilisateurs et partagez vos connaissances.",
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez les fonctionnalités qui font de Ressourcefy la plateforme
            idéale pour partager et découvrir des ressources de qualité.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-all hover:shadow-lg">
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
    </section>
  );
}
