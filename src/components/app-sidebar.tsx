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
} from "@/src/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/ressources",
    icon: Inbox,
  },
  {
    title: "Calendar",
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
    <Sidebar className="">
      <SidebarHeader className="ml-20">
        <SidebarGroupLabel>Ressoucify</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className="bg-inherit  ml-20  ">
        <SidebarGroup>
          <SidebarGroupContent className="flex-col  justify-between h-[80vh]">
            <SidebarMenu className="flex flex-col justify-between items-start">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
