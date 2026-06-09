"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

/**
 * Contact Info Component
 * 
 * Affiche les informations de contact
 */
export function ContactInfo() {
  const contactDetails = [
    {
      icon: Mail,
      title: "Email",
      description: "contact@ressourcefy.com",
      link: "mailto:contact@ressourcefy.com",
    },
    {
      icon: Phone,
      title: "Téléphone",
      description: "+33 1 23 45 67 89",
      link: "tel:+33123456789",
    },
    {
      icon: MapPin,
      title: "Adresse",
      description: "Paris, France",
      link: null,
    },
    {
      icon: Clock,
      title: "Horaires",
      description: "Lun - Ven: 9h - 18h",
      link: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Informations de contact</h2>
        <p className="text-muted-foreground">
          N&apos;hésitez pas à nous contacter pour toute question ou demande
          d&apos;information. Notre équipe est là pour vous aider.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contactDetails.map((detail) => {
          const Icon = detail.icon;
          const content = (
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{detail.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {detail.link ? (
                    <a
                      href={detail.link}
                      className="hover:text-primary transition-colors"
                    >
                      {detail.description}
                    </a>
                  ) : (
                    detail.description
                  )}
                </CardDescription>
              </CardContent>
            </Card>
          );

          return detail.link ? (
            <a key={detail.title} href={detail.link} className="block">
              {content}
            </a>
          ) : (
            <div key={detail.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
