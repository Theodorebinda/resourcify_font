/**
 * Public Layout
 * For unauthenticated users viewing public pages
 * Phase 1: Minimal structural layout
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add public header/navigation in Phase 2 */}
      <main>{children}</main>
      {/* TODO: Add public footer in Phase 2 */}
    </div>
  );
}
