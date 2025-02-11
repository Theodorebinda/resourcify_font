import CardSing from "@/src/components/cardSing";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-2xl font-bold mb-4">Se connecter</h1>
      <CardSing />
    </div>
  );
};

export default LoginPage;
