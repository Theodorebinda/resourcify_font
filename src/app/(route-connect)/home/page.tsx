"use client";
import ResourceSection from "@/src/components/ressourceSections";
import React from "react";

const HomePage = () => {
  return (
    <div>
      <div className="bg-[url(/images/landing-bg.svg)] -z-20 absolute h-screen w-full custom-bg-size mask-image"></div>
      <div className="md:mx-36 mx-5 max-w-full pt-44 pb-8 flex flex-col gap-20 overflow-hidden">
        <ResourceSection />
      </div>
    </div>
  );
};

export default HomePage;
