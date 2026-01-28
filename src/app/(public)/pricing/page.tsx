/**
 * Pricing Page - Redirection vers la section pricing de l'accueil
 * 
 * Cette page redirige vers la section pricing intégrée dans la page d'accueil
 */

import { redirect } from "next/navigation";

export default function PricingPage() {
  redirect("/#pricing");
}
