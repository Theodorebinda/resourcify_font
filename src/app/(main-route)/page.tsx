"use client";

import ResourceSection from "@/src/components/ressourceSections";
import useUsers from "@/src/hooks/useUsers";
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
    <div className="absolute flex flex-col gap-10">
      <div className="mx-56 flex flex-col gap-8 text-center mt-18">
        <h1 className="text-5xl font-bold">{datas?.titre}</h1>
        <p>{datas?.message}</p>

        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-row space-x-[-20px]">
            {users.map((user) => (
              <img
                key={user.id}
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <div className="flex flex-col">
            <p>{`+${users.length} Utilisateurs`}</p>
            <p>Voir les avis</p>
          </div>
        </div>
      </div>
      <ResourceSection />
    </div>
  );
}
