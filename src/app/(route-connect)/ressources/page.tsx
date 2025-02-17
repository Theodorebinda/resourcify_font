"use client";
import SidebarRight from "@/src/components/sideBarRight";
import React from "react";

const ResourcesPage = () => {
  return (
    <div className="w-full  flex justify-between px-10 relative ">
      <div className="flex flex-col w-3/4 ">Ressources</div>
      <div className=" lg:block hidden w-1/3">
        <SidebarRight className="" />
      </div>
    </div>
  );
};

export default ResourcesPage;
