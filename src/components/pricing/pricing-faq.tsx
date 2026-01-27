"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "../../libs/utils";

/**
 * Pricing FAQ Section
 * 
 * Questions fréquentes sur les tarifs et les plans
 * Avec navigation rapide et accordéon
 */
export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      id: "changer-plan",
      question: "Puis-je changer de plan à tout moment ?",
      answer:
        "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet immédiatement et les ajustements de facturation sont calculés au prorata.",
    },
    {
      id: "engagement",
      question: "Y a-t-il un engagement à long terme ?",
      answer:
        "Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.",
    },
    {
      id: "annulation",
      question: "Que se passe-t-il si j'annule mon abonnement ?",
      answer:
        "Vous conservez l'accès à votre plan jusqu'à la fin de la période de facturation. Après cela, votre compte sera rétrogradé au plan gratuit et vous perdrez l'accès aux fonctionnalités premium.",
    },
    {
      id: "taxes",
      question: "Les prix incluent-ils les taxes ?",
      answer:
        "Les prix affichés sont hors taxes. Les taxes applicables seront ajoutées lors du paiement selon votre localisation.",
    },
    {
      id: "etudiants",
      question: "Proposez-vous des remises pour les étudiants ?",
      answer:
        "Oui, nous offrons une réduction de 50% pour les étudiants avec une preuve d'inscription valide. Contactez-nous pour plus d'informations.",
    },
    {
      id: "essai",
      question: "Puis-je essayer Premium avant de payer ?",
      answer:
        "Oui, nous offrons une période d'essai de 14 jours pour le plan Premium. Aucune carte de crédit n'est requise pour commencer l'essai.",
    },
    {
      id: "paiement",
      question: "Quels modes de paiement acceptez-vous ?",
      answer:
        "Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal et les virements bancaires pour les plans annuels.",
    },
    {
      id: "facturation-annuelle",
      question: "Le plan Pro inclut-il une facturation annuelle ?",
      answer:
        "Oui, le plan Pro est disponible en facturation mensuelle ou annuelle. La facturation annuelle offre une réduction de 20%.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollToFaq = (faqId: string) => {
    const element = document.getElementById(faqId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Ouvrir la FAQ après le scroll
      const index = faqs.findIndex((faq) => faq.id === faqId);
      if (index !== -1) {
        setTimeout(() => setOpenIndex(index), 300);
      }
    }
  };

  return (
    <section id="faq" className="py-16 md:py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tout ce que vous devez savoir sur nos tarifs
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {faqs.map((faq) => (
              <Button
                key={faq.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToFaq(faq.id)}
                className="text-xs"
              >
                {faq.question.split(" ").slice(0, 3).join(" ")}...
              </Button>
            ))}
          </div>

          {/* FAQ Items avec accordéon */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={faq.id}
                id={faq.id}
                className="transition-all hover:shadow-md"
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg pr-8">{faq.question}</CardTitle>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
                        openIndex === index && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>
                {openIndex === index && (
                  <CardContent>
                    <CardDescription className="text-base">{faq.answer}</CardDescription>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
