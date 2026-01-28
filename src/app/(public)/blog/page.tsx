/**
 * Blog Page - Page de blog
 * 
 * Route publique - aucune authentification requise
 * Affiche les articles de blog et actualités de Ressourcefy
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  // Articles de blog exemple (à remplacer par des données réelles depuis l'API)
  const blogPosts = [
    {
      id: 1,
      title: "Comment organiser efficacement vos ressources",
      excerpt:
        "Découvrez les meilleures pratiques pour organiser et catégoriser vos ressources de manière efficace.",
      author: "Équipe Ressourcefy",
      date: "15 Janvier 2026",
      category: "Conseils",
    },
    {
      id: 2,
      title: "Les nouvelles fonctionnalités de Ressourcefy",
      excerpt:
        "Explorez les dernières fonctionnalités ajoutées à la plateforme pour améliorer votre expérience.",
      author: "Équipe Ressourcefy",
      date: "10 Janvier 2026",
      category: "Actualités",
    },
    {
      id: 3,
      title: "Comment partager vos ressources avec la communauté",
      excerpt:
        "Apprenez à partager vos meilleures découvertes et à contribuer à la communauté Ressourcefy.",
      author: "Équipe Ressourcefy",
      date: "5 Janvier 2026",
      category: "Tutoriel",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Blog Ressourcefy
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Découvrez nos articles, actualités et conseils pour tirer le meilleur parti
              de Ressourcefy.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.id} className="flex flex-col transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {post.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-4 text-muted-foreground">{post.excerpt}</p>
                    <Button asChild variant="ghost" className="group">
                      <Link href={`/blog/${post.id}`}>
                        Lire la suite
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State - À afficher quand il n'y a pas d'articles */}
            {blogPosts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucun article de blog disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
