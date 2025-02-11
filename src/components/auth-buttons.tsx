"use client";

import { Home } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import DefaultAvatar from "../../public/default_avatar.jpg";
// import { usePostHog } from "posthog-js/react";
import { Buttons } from "../ui/button";

interface Props {
  profileImg?: StaticImageData | undefined | string;
  className?: string;
  children?: React.ReactNode;
  name?: string;
}

export const HomeButton = ({ className }: Props) => {
  return (
    <Buttons
      variant="primary"
      outline="outline"
      buttonType="link"
      Icon={Home}
      baseUrl="/"
      className={className}
    >
      Page d&apos;accueil
    </Buttons>
  );
};

export const ServiceButton = ({ children }: Props) => {
  return (
    <Buttons
      variant="primary"
      buttonType="link"
      baseUrl="/courses"
      className="w-full"
    >
      {children ? children : "Services"}
    </Buttons>
  );
};

export const SignInButton = () => {
  return (
    <Buttons
      variant="primary"
      buttonType="link"
      baseUrl="/signin"
      className="w-full md:w-auto"
    >
      Se connecter
    </Buttons>
  );
};

// export const SignOutButton = ({ className }: Props) => {
//   const posthog = usePostHog();
//   return (
//     <Buttons
//       variant="primary"
//       buttonType="action"
//       action={() => {
//         signOut({ callbackUrl: "/" });
//         posthog.reset(true);
//       }}
//       className={className}
//     >
//       <LogOut className="mr-2 h-5 w-5" /> Déconnexion
//     </Buttons>
//   );
// };

export const ProfileButton = ({ profileImg, name }: Props) => {
  return (
    <>
      <Link href="/dashboard">
        <div className="items-center w-full flex justify-center flex-row gap-2 pb-4 lg:pb-0">
          <Image
            width={240}
            height={240}
            className="w-12 h-12 rounded-full"
            src={profileImg ? profileImg : DefaultAvatar}
            alt={name!}
          />
        </div>
      </Link>
    </>
  );
};
