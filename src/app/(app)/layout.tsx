/**
 * App Layout
 * For fully onboarded users accessing the application
 * Phase 1: Minimal structural layout
 */

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add app header/navigation in Phase 2 */}
      <div className="flex">
        {/* TODO: Add sidebar in Phase 2 */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
