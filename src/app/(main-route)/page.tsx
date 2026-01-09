"use client";

import HeroSection from "@/src/components/heroSection";
import ResourceSection from "@/src/components/ressourceSections";
import { useHello } from "@/src/hooks/use-hello";
import { useUsers } from "@/src/hooks/use-users";

export default function Home() {
  const {
    data: helloData,
    isLoading: helloLoading,
    isError: helloError,
  } = useHello();
  const {
    data: usersData = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers();

  const isLoading = helloLoading || usersLoading;
  const hasError = helloError || usersError;

  return (
    <div>
      <div className="bg-[url(/images/download.svg)] -z-20 absolute h-screen w-full custom-bg-size mask-image"></div>
      <div className="md:mx-36 mx-5 max-w-full pt-44 pb-8 flex flex-col gap-20 overflow-hidden ">
        {hasError ? (
          <p className="text-red-500">
            Impossible de charger les informations.
          </p>
        ) : (
          <HeroSection
            title={helloData?.title}
            message={helloData?.message}
            users={usersData}
            isLoading={isLoading}
          />
        )}
        <ResourceSection />
      </div>
    </div>
  );
}
