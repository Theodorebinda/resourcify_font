/**
 * Contact Page - Page de contact
 * 
 * Route publique - aucune authentification requise
 * 
 * Sections:
 * - Hero: Introduction à la page de contact
 * - Contact Form: Formulaire de contact avec validation
 * - Contact Info: Informations de contact (email, téléphone, adresse, horaires)
 */

import { ContactForm } from "../../../components/contact/contact-form";
import { ContactInfo } from "../../../components/contact/contact-info";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Une question ? Une suggestion ? Notre équipe est là pour vous aider.
              Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                    <CardDescription>
                      Remplissez le formulaire et nous vous répondrons rapidement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactForm />
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div>
                <ContactInfo />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
