/**
 * App Sidebar Component - Style X/Twitter
 * 
 * Sidebar gauche fixe avec navigation principale.
 * Design inspiré de X (Twitter) :
 * - Icônes grandes avec labels
 * - Espacement généreux
 * - Logo en haut
 * - Profil utilisateur en bas
 * 
 * Rules:
 * - Uses Zustand for UI state (sidebarOpen)
 * - NO auth logic (middleware handles access)
 * - NO redirects
 * - Uses useUser() for user data (TanStack Query)
 * - Pure UI component
 */

"use client";

import * as React from "react";
import { useUser } from "../../services/api/queries/auth-queries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar-custom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "../../services/api/queries/auth-queries";
import { ROUTES } from "../../constants/routes";
import {
  Home,
  Inbox,
  Settings,
  User,
  LogOut,
  Shield,
  Search,
  Bookmark,
  Bell,
  LayoutDashboard,
  Users,
  Tags,
  FileText,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../libs/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface AdminSubItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminSubItems: AdminSubItem[] = [
  {
    title: "Dashboard",
    url: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Utilisateurs",
    url: ROUTES.ADMIN.USERS,
    icon: Users,
  },
  {
    title: "Tags",
    url: ROUTES.ADMIN.TAGS,
    icon: Tags,
  },
  {
    title: "Ressources",
    url: ROUTES.ADMIN.RESOURCES,
    icon: FileText,
  },
  {
    title: "Abonnements",
    url: ROUTES.ADMIN.SUBSCRIPTIONS,
    icon: CreditCard,
  },
  {
    title: "Paiements",
    url: ROUTES.ADMIN.PAYMENTS,
    icon: DollarSign,
  },
];

const navItems: NavItem[] = [
  {
    title: "Accueil",
    url: ROUTES.APP.DASHBOARD,
    icon: Home,
  },
  {
    title: "Explorer",
    url: "/app/explore",
    icon: Search,
  },
  {
    title: "Notifications",
    url: "/app/notifications",
    icon: Bell,
  },
  {
    title: "Ressources",
    url: "/app/resources",
    icon: Inbox,
  },  
  {
    title: "Favoris",
    url: "/app/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Paramètres",
    url: "/app/settings",
    icon: Settings,
  },
];

function AppSidebarContent() {
  const { user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  // Le nouveau sidebar personnalisé n'a plus besoin de la synchronisation complexe
  // On garde juste useSidebar pour la compatibilité mais on ne l'utilise pas
  useSidebar();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push(ROUTES.AUTH.LOGIN);
    } catch {
      // Error handling is done by mutation
    }
  };

  const getUserInitials = (username?: string, email?: string): string => {
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  
  // Ouvrir automatiquement le menu admin si on est sur une page admin
  React.useEffect(() => {
    if (pathname?.startsWith("/admin/")) {
      setAdminMenuOpen(true);
    }
  }, [pathname]);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <Link href={ROUTES.APP.DASHBOARD} className="flex items-center">
          <h1 className="text-2xl font-bold">Ressourcefy</h1>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 justify-end">
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start rounded-full px-4 py-3 text-lg font-normal hover:bg-muted",
                        isActive && "font-semibold"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-4">
                        <item.icon className="h-6 w-6" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* Menu Administration (sous-menu) - Visible uniquement pour ADMIN et SUPERADMIN */}
              {isAdmin && (
                <SidebarMenuItem>
                  <div>
                    <SidebarMenuButton
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className={cn(
                        "w-full justify-between rounded-full px-4 py-3 text-lg font-normal hover:bg-muted",
                        pathname?.startsWith("/admin/") && "font-semibold"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Shield className="h-6 w-6" />
                        <span>Administration</span>
                      </div>
                      {adminMenuOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </SidebarMenuButton>
                    
                    {/* Sous-menu admin */}
                    {adminMenuOpen && (
                      <div className="ml-8 mt-1 space-y-1">
                        {adminSubItems.map((subItem) => {
                          const isSubActive = pathname === subItem.url || pathname?.startsWith(subItem.url + "/");
                          return (
                            <SidebarMenuButton
                              key={subItem.title}
                              asChild
                              className={cn(
                                "w-full justify-start rounded-full px-4 py-2 text-base font-normal hover:bg-muted",
                                isSubActive && "font-semibold bg-muted"
                              )}
                            >
                              <Link href={subItem.url} className="flex items-center gap-3">
                                <subItem.icon className="h-5 w-5" />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Bouton principal (style X) */}
        <div className="mt-4 px-3">
          <Button className="w-full rounded-full px-4 py-6 text-lg font-semibold">
            Publier
          </Button>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3 rounded-full p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-full p-3 hover:bg-muted transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getUserInitials(user.username, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-left">
                  {user.username && (
                    <span className="text-sm font-semibold">{user.username}</span>
                  )}
                  {user.email && (
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user.email}
                    </span>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56"
            >
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.APP.DASHBOARD)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>
                  {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  return <AppSidebarContent />;
}
