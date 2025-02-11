import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen ">
      <div
        className="bg-[url(/images/download.svg)] -z-20 absolute h-screen w-full custom-bg-size mask-image
"
      ></div>
      {children}
    </main>
  );
};

export default AuthLayout;
