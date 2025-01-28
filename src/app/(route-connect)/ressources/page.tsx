"use client";
import React from "react";
import ResourceSection from "@/src/components/ressourceSections";

const ResourcesPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <div className="md:mx-36 mx-5 max-w-full pt-10 pb-8 flex flex-col gap-20 overflow-hidden">
        <ResourceSection />
      </div>
    </div>
  );
};

export default ResourcesPage;
