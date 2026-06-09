/**
 * Auth Layout
 * For authentication pages (login, register, etc.)
 * Phase 1: Minimal structural layout
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* TODO: Add auth branding/logo in Phase 2 */}
        {children}
      </div>
    </div>
  );
}
