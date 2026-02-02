/**
 * Admin Layout
 * 
 * Layout pour toutes les pages d'administration
 * Inclut la navigation admin et la vérification des permissions
 */

"use client";

import { useUser } from "../../../services/api/queries";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "../../../constants/routes";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Tags, 
  FileText, 
  CreditCard, 
  DollarSign,
  Shield
} from "lucide-react";
import { cn } from "../../../libs/utils";

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Utilisateurs",
    href: ROUTES.ADMIN.USERS,
    icon: Users,
  },
  {
    title: "Tags",
    href: ROUTES.ADMIN.TAGS,
    icon: Tags,
  },
  {
    title: "Ressources",
    href: ROUTES.ADMIN.RESOURCES,
    icon: FileText,
  },
  {
    title: "Abonnements",
    href: ROUTES.ADMIN.SUBSCRIPTIONS,
    icon: CreditCard,
  },
  {
    title: "Paiements",
    href: ROUTES.ADMIN.PAYMENTS,
    icon: DollarSign,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Vérifier si l'utilisateur est admin ou superadmin
      // Note: Le backend vérifie les permissions, mais on peut faire une vérification côté client
      // pour améliorer l'UX (redirection immédiate si non autorisé)
      const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
      if (!isAdmin) {
        router.replace(ROUTES.APP.DASHBOARD);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return null; // Redirection en cours
  }

  return (
    <div className="flex min-h-screen bg-background max-w-4xl mx-auto">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Shield className="mr-2 h-5 w-5" />
            <span className="font-semibold">Administration</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">{user.email}</p>
              <p className="mt-1">Rôle: {user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
