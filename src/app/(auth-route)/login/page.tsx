import CardSing from "@/src/components/cardSing";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex flex-col flex-wrap md:flex-row  items-center justify-center min-h-screen md:w-[80rem] md:gap-10">
      <div className="md:w-[40%] md:h-[24rem] flex flex-col justify-start items-start gap-8   ">
        <h3 className="font-bold text-5xl ">Resourcify</h3>
        <div className="flex flex-col gap-4">
          <span>
            Crée des articles qui résonnent, découvre des livres qui marquent,
            et rejoins une communauté qui partage tes passions.
          </span>
          <span>
            {" 💡 Trouve ce qui t’inspire et partage ce qui te passionne."}
          </span>
          <span>{"📚 Ne lis plus seul. Une communaute t'attend."}</span>
          <span>{"🖋️ Ton savoir peut éclairer d'autres esprits."}</span>
          <span>
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
