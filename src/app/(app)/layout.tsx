/**
 * App Layout - Style X/Twitter
 * 
 * Layout 3 colonnes :
 * - Colonne gauche : Sidebar fixe avec navigation
 * - Colonne centrale : Contenu principal (largeur max fixe)
 * - Colonne droite : Suggestions/Tendances (optionnel)
 * 
 * Rules:
 * - NO auth logic (middleware handles access)
 * - NO redirects
 * - Components assume guards already ran
 * - Responsive layout (desktop + mobile)
 */

"use client";

import { AppSidebar } from "../../components/shared/app-sidebar";
import { SidebarProvider } from "../../components/ui/sidebar-custom";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen max-w-7xl mx-auto bg-background">
        {/* Sidebar gauche - Style X */}
        <AppSidebar />
        
        {/* Colonne centrale - Contenu principal */}
        <main className="flex-1 overflow-y-auto scrollbar-hide border-x border-border/50 bg-background">
          <div className="mx-auto ">
            {children}
          </div>
        </main>
        
        {/* Colonne droite - Suggestions (optionnel, masquée sur mobile) */}
        <aside className="hidden lg:block w-80 border-l border-border/50 overflow-y-auto scrollbar-hide bg-background">
          <div className="p-6">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="font-semibold mb-2">Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Contenu de suggestions à venir
              </p>
            </div>
          </div>
        </aside>
      </div>
    </SidebarProvider>
  );
}
