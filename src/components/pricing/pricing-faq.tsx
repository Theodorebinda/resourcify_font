"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

/**
 * Pricing FAQ Section
 * 
 * Questions fréquentes sur les tarifs et les plans
 */
export function PricingFaq() {
  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer:
        "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet immédiatement et les ajustements de facturation sont calculés au prorata.",
    },
    {
      question: "Y a-t-il un engagement à long terme ?",
      answer:
        "Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.",
    },
    {
      question: "Que se passe-t-il si j'annule mon abonnement ?",
      answer:
        "Vous conservez l'accès à votre plan jusqu'à la fin de la période de facturation. Après cela, votre compte sera rétrogradé au plan gratuit et vous perdrez l'accès aux fonctionnalités premium.",
    },
    {
      question: "Les prix incluent-ils les taxes ?",
      answer:
        "Les prix affichés sont hors taxes. Les taxes applicables seront ajoutées lors du paiement selon votre localisation.",
    },
    {
      question: "Proposez-vous des remises pour les étudiants ?",
      answer:
        "Oui, nous offrons une réduction de 50% pour les étudiants avec une preuve d'inscription valide. Contactez-nous pour plus d'informations.",
    },
    {
      question: "Puis-je essayer Premium avant de payer ?",
      answer:
        "Oui, nous offrons une période d'essai de 14 jours pour le plan Premium. Aucune carte de crédit n'est requise pour commencer l'essai.",
    },
    {
      question: "Quels modes de paiement acceptez-vous ?",
      answer:
        "Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal et les virements bancaires pour les plans annuels.",
    },
    {
      question: "Le plan Pro inclut-il une facturation annuelle ?",
      answer:
        "Oui, le plan Pro est disponible en facturation mensuelle ou annuelle. La facturation annuelle offre une réduction de 20%.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur nos tarifs
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{faq.answer}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
