/**
 * Custom Sidebar Component
 * 
 * Sidebar personnalisé pour l'application Ressourcefy
 * Style X/Twitter - Simple et épuré
 */

"use client";

import * as React from "react";
import { cn } from "../../libs/utils";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggle,
    }),
    [isOpen, toggle]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-screen w-[17.5rem] bg-background border-r border-border/50 transition-transform duration-200",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarContent({
  className,
  children,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto scrollbar-hide px-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarGroup({
  className,
  children,
  ...props
}: SidebarGroupProps) {
  return (
    <div
      className={cn("relative flex w-full min-w-0 flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarGroupContent({
  className,
  children,
  ...props
}: SidebarGroupContentProps) {
  return (
    <div className={cn("w-full text-sm", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export function SidebarGroupLabel({
  className,
  children,
  asChild = false,
  ...props
}: SidebarGroupLabelProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground",
        className,
        (children.props as { className?: string }).className
      ),
      ...props,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export function SidebarMenu({
  className,
  children,
  ...props
}: SidebarMenuProps) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: SidebarMenuItemProps) {
  return (
    <li className={cn("relative", className)} {...props}>
      {children}
    </li>
  );
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className,
        (children.props as { className?: string }).className
      ),
      ref,
      ...props,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, children, ...props }, ref) => {
  const { toggle } = useSidebar();

  return (
    <button
      ref={ref}
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children || "☰"}
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
