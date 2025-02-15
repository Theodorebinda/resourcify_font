"use client";
import SidebarRight from "@/src/components/sideBarRight";
import React, { JSX } from "react";

function HomePage(): JSX.Element {
  // Ajout du type de retour
  return (
    <div className="w-full  flex justify-between px-10 ">
      <div className="flex flex-col w-3/4 ">Home</div>
      <div className="stocky  top-20  lg:block hidden w-1/3">
        <SidebarRight className="" />
      </div>
    </div>
  );
}

export default HomePage;
