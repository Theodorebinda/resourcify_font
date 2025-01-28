"use client";
import React from "react";
import ResourceSection from "@/src/components/ressourceSections";

const ResourcesPage = () => {
  return (
    <div className="mx-5 pt-32">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <div className="">
        <ResourceSection />
      </div>
    </div>
  );
};

export default ResourcesPage;
