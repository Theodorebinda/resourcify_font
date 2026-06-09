/**
 * Public Layout
 * 
 * Layout pour les pages publiques (landing, pricing, about, contact)
 * Inclut le header et le footer publics avec navigation et sélecteur de thème
 */

import { PublicHeader } from "../../components/shared/public-header";
import { PublicFooter } from "../../components/shared/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
