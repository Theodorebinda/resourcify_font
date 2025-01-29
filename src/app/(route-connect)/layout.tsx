import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import AppSidebar from "@/src/components/app-sidebar";
import SidebarRight from "@/src/components/sideBarRight";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="w-full">
      <AppSidebar />
      <main className="">
        <SidebarTrigger />
        {children}
      </main>
      <SidebarRight className="sticky top-10 right-10 lg:block hidden" />
    </SidebarProvider>
  );
}
