/**
 * User Space Page
 * Placeholder for post-onboarding destination.
 * Style X/Twitter - Contenu dans la colonne centrale
 */

export default function UserSpacePage() {
  return (
    <div className="min-h-screen">
      {/* Header fixe en haut */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Espace utilisateur</h1>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="py-6 space-y-4">
        <p className="text-muted-foreground">
          Bienvenue ! Ton onboarding est terminé.
        </p>
      </div>
    </div>
  );
}
