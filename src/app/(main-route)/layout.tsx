"use client";

import Footer from "@/src/components/shared/footer";
import NavigationWrapper from "@/src/routes/navigationWraper";
// import { GlobalStyles } from "@/src/styles/globalStyle";
// import { darkTheme, lightTheme } from "@/src/styles/theme";
import React from "react";
// import { ThemeProvider } from "styled-components";

function MainRoutesLayout({ children }: { children: React.ReactNode }) {
  // const selectedTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <div className=" min-h-screen flex flex-col max-w-7xl mx-auto">
      {/* <ThemeProvider theme={selectedTheme}> */}
      {/* <GlobalStyle /> */}
      <NavigationWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* </ThemeProvider> */}
    </div>
  );
}

export default React.memo(MainRoutesLayout);
