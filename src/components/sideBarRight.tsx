"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Category, documents } from "./ressourceSections";
import TutorielsList from "./tutoriels";

interface SidebarRightProps {
  className?: string; // Définition du type pour className
}
const SidebarRight: React.FC<SidebarRightProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All categories");

  return (
    <div className={`${className}  w-2/3`}>
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <div className="flex flex-col">
        <div className="flex gap-2 mb-4 flex-wrap ">
          {Object.keys(documents).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as Category)}
              className={`p-1 text-xs rounded ${
                selectedCategory === category
                  ? "bg-blue-500 text-white font-medium"
                  : "bg-gray-200 text-blue-900 font-medium"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 justify-between h-[35vh]">
          <div className="flex justify-between flex-wrap gap-2">
            {documents[selectedCategory].slice(0, 4).map((doc, index) => (
              <Image
                width={90}
                height={100}
                src={doc}
                key={index}
                className="mb-2"
                alt="livre"
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button className="bg-blue-500 text-white font-medium p-1 text-xs rounded hover:bg-blue-600 transition duration-200">
              Plus de livre
            </button>
          </div>
        </div>
      </div>
      <TutorielsList />
    </div>
  );
};

export default SidebarRight;
