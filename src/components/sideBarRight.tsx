"use client";
import React from "react";
import InputSearch from "./inputSearch";

interface SidebarRightProps {
  className?: string; // Définition du type pour className
}
const SidebarRight: React.FC<SidebarRightProps> = ({ className }) => {
  return (
    <div className={`${className} sticky top-4`}>
      <div className="w-full">
        <InputSearch />
      </div>
      <div className="flex flex-col pt-10  ">
        <div className="advertisement bg-[#0d1117] p-4 rounded mt-4 h-[28vh]">
          <h2 className="text-lg font-bold">Sponsored</h2>
          <p className="text-sm">Check out this amazing product!</p>
          <a href="https://example.com" className="text-blue-500 underline">
            Learn more
          </a>
        </div>
        <div className="advertisement bg-[#0d1117] p-4 rounded mt-4 h-[36vw]">
          <h2 className="text-lg font-bold">Sponsored</h2>
          <p className="text-sm">Check out this amazing product!</p>
          <a href="https://example.com" className="text-blue-500 underline">
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
