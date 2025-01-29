"use client";

import ResourceSection from "@/src/components/ressourceSections";
import React, { JSX } from "react";

function HomePage(): JSX.Element {
  // Ajout du type de retour
  return (
    <div className="w-full px-10">
      <div className="flex flex-col ">
        <h1> HOME PAGE</h1>
        <ResourceSection />
      </div>
    </div>
  );
}

export default HomePage;
