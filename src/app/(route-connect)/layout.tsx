import AppSidebar from "@/src/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
