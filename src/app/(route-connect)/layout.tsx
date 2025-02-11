import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import AppSidebar from "@/src/components/app-sidebar";
import SidebarRight from "@/src/components/sideBarRight";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className=" ">
      <AppSidebar />
      <main className="">
        <SidebarTrigger />
        {children}
      </main>
      <SidebarRight className="sticky top-20 right-8 lg:block hidden" />
    </SidebarProvider>
  );
}
