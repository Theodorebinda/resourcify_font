import React from "react";

const SignInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-2xl font-bold mb-4">{"S'inscrire"}</h1>
      <form className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {"S'inscrire"}
        </button>
      </form>
      <p className="mt-4">
        Déjà un compte?{" "}
        <a href="/login" className="text-blue-500">
          Se connecter
        </a>
      </p>
    </div>
  );
};

export default SignInPage;
