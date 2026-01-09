"use client";

import Footer from "@/src/components/footer";
import NavigationWrapper from "@/src/routes/navigationWraper";
// import { GlobalStyle } from "@/src/styles/globalStyle";
// import { darkTheme, lightTheme } from "@/src/styles/theme";
import React from "react";
// import { ThemeProvider } from "styled-components";

function MainRoutesLayout({ children }: { children: React.ReactNode }) {
  // const selectedTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <div className="">
      {/* <ThemeProvider theme={selectedTheme}> */}
      {/* <GlobalStyle /> */}
      <NavigationWrapper />
      {children}
      <Footer />
      {/* </ThemeProvider> */}
    </div>
  );
}

export default React.memo(MainRoutesLayout);
