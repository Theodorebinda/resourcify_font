import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
// import SidebarRight from "@/src/components/sideBarRight";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className=" ">
      <AppSidebar />
      <main className="w-full flex flex-col ">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
