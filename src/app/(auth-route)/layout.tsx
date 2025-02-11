import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen relative box-border ">
      <div
        className="bg-[url(/images/download.svg)] -z-20 absolute h-screen w-full auth-bg-size mask-image
"
      ></div>
      {children}
    </main>
  );
};

export default AuthLayout;
