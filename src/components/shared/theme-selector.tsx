"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUIStore } from "../../stores/use-ui-store";
import type { Theme } from "../../stores/use-ui-store";

/**
 * Theme Selector Component
 * 
 * Permet de changer le thème entre système (par défaut), light et dark
 * Utilise le store Zustand pour la persistance
 */
export function ThemeSelector() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "system",
      label: "Système",
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      value: "light",
      label: "Clair",
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: "dark",
      label: "Sombre",
      icon: <Moon className="h-4 w-4" />,
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {currentTheme.icon}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className="flex items-center gap-2"
          >
            {themeOption.icon}
            <span>{themeOption.label}</span>
            {theme === themeOption.value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
