"use client";

import Footer from "@/src/components/footer";
import { Toaster } from "@/src/components/ui/toaster";
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
    <div className="">
      {/* // <ThemeProvider theme={selectedTheme}> */}
      {/* <GlobalStyle /> */}
      <NavigationWrapper toggleTheme={toggleTheme} currentTheme={theme} />
      {children}
      <Toaster />
      <Footer />

      {/* // </ThemeProvider> */}
    </div>
  );
}

export default React.memo(MainRoutesLayout);
