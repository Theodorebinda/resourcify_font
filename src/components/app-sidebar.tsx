import {
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";

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
  //   useSidebar,
} from "@/src/components/ui/sidebar-custom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

// Menu items.
const items = [
  {
    title: "Accueil",
    url: "/home",
    icon: Home,
  },
  {
    title: "Ressources",
    url: "/ressources",
    icon: Inbox,
  },
  {
    title: "Chat",
    url: "/home",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/ressources",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/about",
    icon: Settings,
  },
];

export default function AppSidebar() {
  // const {
  //     state,
  //     open,
  //     setOpen,
  //     openMobile,
  //     setOpenMobile,
  //     isMobile,
  //     toggleSidebar,
  //   } = useSidebar()
  return (
    <Sidebar className="bg-[#0d1117]">
      <SidebarHeader className="ml-10 mb-20">
        <SidebarGroupLabel>Ressoucify</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className="bg-inherit  ml-10  ">
        <SidebarGroup>
          <SidebarGroupContent className="flex-col  justify-between h-[80vh]">
            <SidebarMenu className="flex gap-10 flex-col justify-between items-start">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="">
                    <a href={item.url}>
                      <item.icon size={80} />
                      <span className="text-2xl font-bold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="ml-20  flex items-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <User2 /> Theo
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem>
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
