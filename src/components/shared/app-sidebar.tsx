/**
 * App Sidebar Component
 * 
 * Sidebar for authenticated application shell.
 * 
 * Rules:
 * - Uses Zustand for UI state (sidebarOpen)
 * - NO auth logic (middleware handles access)
 * - NO redirects
 * - NO conditional rendering based on guessed state
 * - Uses useUser() for user data (TanStack Query)
 * - Pure UI component
 */

"use client";

import * as React from "react";
import { useUIStore } from "../../stores/use-ui-store";
import { useUser } from "../../services/api/queries/auth-queries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { useLogout } from "../../services/api/queries/auth-queries";
import { ROUTES } from "../../constants/routes";
import {
  Home,
  Inbox,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: ROUTES.APP.DASHBOARD,
    icon: Home,
  },
  {
    title: "Resources",
    url: "/app/resources",
    icon: Inbox,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
  {
    title: "Administration",
    url: ROUTES.ADMIN.DASHBOARD,
    icon: Shield,
    adminOnly: true,
  },
];

function AppSidebarContent() {
  const { user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { open, setOpen } = useSidebar();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const lastSyncedRef = React.useRef<{ zustand: boolean; provider: boolean }>({
    zustand: sidebarOpen,
    provider: open,
  });

  // Sync Zustand state to SidebarProvider (Zustand is source of truth)
  React.useEffect(() => {
    if (sidebarOpen !== lastSyncedRef.current.zustand) {
      lastSyncedRef.current.zustand = sidebarOpen;
      if (open !== sidebarOpen) {
        setOpen(sidebarOpen);
        lastSyncedRef.current.provider = sidebarOpen;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen]); // Only depend on sidebarOpen

  // Sync SidebarProvider changes to Zustand (user interaction with sidebar)
  React.useEffect(() => {
    if (open !== lastSyncedRef.current.provider) {
      lastSyncedRef.current.provider = open;
      if (sidebarOpen !== open) {
        setSidebarOpen(open);
        lastSyncedRef.current.zustand = open;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depend on open

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

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroupLabel>Ressourcefy</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => {
                  // Filtrer les items admin si l'utilisateur n'est pas admin
                  if (item.adminOnly) {
                    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
                    return isAdmin;
                  }
                  return true;
                })
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.username, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  {user.username && (
                    <span className="text-sm font-medium">{user.username}</span>
                  )}
                  {user.email && (
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
                <ChevronUp className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.APP.DASHBOARD)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
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
