/**
 * App Layout
 * 
 * For fully onboarded users accessing the application.
 * 
 * Rules:
 * - NO auth logic (middleware handles access)
 * - NO redirects
 * - Components assume guards already ran
 * - Responsive layout (desktop + mobile)
 */

"use client";

import { AppHeader } from "../../components/shared/app-header";
import { AppSidebar } from "../../components/shared/app-sidebar";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { Separator } from "../../components/ui/separator";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <Separator />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
