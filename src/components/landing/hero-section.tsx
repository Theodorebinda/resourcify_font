"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ROUTES } from "../../constants/routes";
import { ArrowRight, BookOpen, Users, Share2 } from "lucide-react";

/**
 * Hero Section - Point d'entrée principal
 * 
 * Présente Ressourcefy et ses fonctionnalités principales
 * Conforme à l'architecture frontend-only
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
            <BookOpen className="h-4 w-4" />
            <span>Plateforme de partage de ressources</span>
          </div>

          {/* Titre principal */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Partagez et découvrez des{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ressources
            </span>{" "}
            de qualité
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Ressourcefy est votre plateforme pour partager, découvrir et organiser
            les meilleures ressources éducatives, tutoriels et contenus utiles.
            Rejoignez une communauté passionnée par l&apos;apprentissage.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link href={ROUTES.AUTH.REGISTER}>
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">En savoir plus</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <Users className="mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-sm text-muted-foreground">Ressources partagées</div>
            </div>
            <div className="flex flex-col items-center">
              <Share2 className="mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-muted-foreground">Catégories</div>
            </div>
          </div>
        </div>

        {/* Video Demo Section - Indépendante du conteneur max-w-4xl */}
        <div className="mt-20 w-full">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted shadow-lg">
              <iframe
                src="https://player.vimeo.com/video/1154650649"
                className="absolute left-0 top-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="WhatsApp Video 2026-01-14 at 13.33.01"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
