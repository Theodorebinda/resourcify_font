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
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-20 h-full w-full bg-[url(/images/download.svg)] bg-cover bg-center custom-bg-size mask-image" />
      <div className="max-w-full pt-44 pb-8 flex flex-col gap-20 overflow-hidden ">
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
