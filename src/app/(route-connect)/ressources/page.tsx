"use client";
import React from "react";
import ResourceSection from "@/src/components/ressourceSections";

const ResourcesPage = () => {
  return (
    <div className="w-full ">
      <h1 className="text-2xl font-bold">Resources</h1>
      <div className="">
        <ResourceSection />
      </div>
    </div>
  );
};

export default ResourcesPage;
