"use client";

import { useTheme } from "@/src/libs/useTheme/useTheme";
import NavigationWrapper from "@/src/routes/navigationWraper";
// import { GlobalStyle } from "@/src/styles/globalStyle";
// import { darkTheme, lightTheme } from "@/src/styles/theme";
import React from "react";
// import { ThemeProvider } from "styled-components";

function MainRoutesLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  // const selectedTheme = theme === "light" ? lightTheme : darkTheme;

  if (theme === null) {
    return <p>Chargement</p>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark bg-grid-pattern">
      {/* // <ThemeProvider theme={selectedTheme}> */}
      {/* <GlobalStyle /> */}
      <NavigationWrapper toggleTheme={toggleTheme} currentTheme={theme} />
      {children}
      {/* <Footer /> */}
      {/* // </ThemeProvider> */}
    </div>
  );
}

export default React.memo(MainRoutesLayout);