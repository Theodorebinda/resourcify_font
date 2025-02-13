import CardSing from "@/src/components/cardSing";
import { Home } from "lucide-react";
import Link from "next/link";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex flex-col flex-wrap md:flex-row  items-center justify-center min-h-screen md:w-[80rem] md:gap-10">
      <div className="md:w-[40%] md:h-[24rem] flex flex-col justify-start items-start gap-8   ">
        <Link href="/" className="md:absolute top-20">
          <Home />
        </Link>
        <h3 className="font-bold text-5xl ">Resourcify</h3>
        <div className="flex flex-col gap-4">
          <span className="text-3xl text-gray-100">
            Crée des articles, découvre des livres, et rejoins une communauté.
          </span>
          <span className="text-xl">
            {" 💡 Trouve ce qui t’inspire et partage ce qui te passionne."}
          </span>
          <span className="text-xl">
            {"📚 Ne lis plus seul. Une communaute t'attend."}
          </span>
          <span className="text-xl">
            {"🖋️ Ton savoir peut éclairer d'autres esprits."}
          </span>
          <span className="text-xl">
            {
              "Un lecteur vit mille vies avant de mourir. Celui qui ne lit pas n’en vit qu’une"
            }
          </span>
        </div>
      </div>
      <div className="md:w-[35rem]">
        <CardSing />
      </div>
    </div>
  );
};

export default LoginPage;
