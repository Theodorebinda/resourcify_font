"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ROUTES } from "../../constants/routes";
import { ArrowRight } from "lucide-react";

/**
 * CTA Section
 * 
 * Appel à l'action final pour inciter à l'inscription
 */
export function CtaSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Prêt à commencer ?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Rejoignez des milliers d&apos;utilisateurs qui partagent et découvrent
              déjà des ressources de qualité sur Ressourcefy.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link href={ROUTES.AUTH.REGISTER}>
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={ROUTES.AUTH.LOGIN}>Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
