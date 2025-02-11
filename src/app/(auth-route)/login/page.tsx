import CardSing from "@/src/components/cardSing";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex flex-col flex-wrap md:flex-row  items-center justify-center min-h-screen md:w-[80rem] md:gap-10">
      <div className="md:w-[40%] md:h-[24rem] flex flex-col justify-start items-start gap-20   ">
        <h3 className="font-bold text-5xl ">Resourcify</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel
          voluptatum accusamus pariatur corporis quis voluptatem perferendis
          aspernatur, a tempore facere maiores delectus repellendus eum
          repudiandae, dolores minus saepe tenetur molestiae architecto
          exercitationem deleniti. Facere soluta sapiente nesciunt harum
          similique earum atque maiores, consectetur velit nam ratione eveniet.
          Voluptatem, animi corporis!
        </p>
      </div>
      <div className="md:w-[35rem]">
        <CardSing />
      </div>
    </div>
  );
};

export default LoginPage;
