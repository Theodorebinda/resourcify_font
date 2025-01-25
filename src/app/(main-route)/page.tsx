"use client";

import HeroSection from "@/src/components/heroSection";
import ResourceSection from "@/src/components/ressourceSections";
import useUsers from "@/src/hooks/userUses";
import { HelloResponse } from "@/src/models/hello";
import useUserStore from "@/src/stores/useStore";
import { useState, useEffect } from "react";

export default function Home() {
  const [datas, setDatas] = useState<HelloResponse | null>(); // Typage de l'état
  const [load, setLoad] = useState(false);
  const { users } = useUserStore();

  console.log(users);

  useUsers();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("http://localhost:3000/");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const helloResponse = new HelloResponse(
          data.titre,
          data.message,
          data.status,
          data.image
        ); // Utilisation de la classe
        setDatas(helloResponse);
        setLoad(true);
        console.log({ helloResponse });
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, []);

  const exportedData = { datas, load };
  console.log(exportedData);

  console.log({ datas });
  return (
    <div>
      <div
        className="bg-[url(/images/download.svg)] -z-20 absolute h-screen w-full custom-bg-size mask-image
"
      ></div>
      <div className="md:mx-36   mx-5 max-w-full  pt-44 pb-8 flex flex-col gap-20 overflow-hidden ">
        <HeroSection
          title={datas?.titre}
          message={datas?.message}
          users={users}
        />
        <ResourceSection />
      </div>{" "}
    </div>
  );
}
