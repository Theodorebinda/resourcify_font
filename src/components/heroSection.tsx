import React from "react";
import { User } from "../models/users";
import Image from "next/image";

interface HeroSectionProps {
  title?: string;
  message?: string;
  users: User[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, message, users }) => {
  return (
    <div className="mx-56 flex flex-col gap-8 text-center mt-18">
      <h1 className="text-5xl font-bold">{title}</h1>
      <p>{message}</p>

      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-row space-x-[-20px]">
          {users.map((user) => (
            <Image
              key={user.id}
              src={user.image}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full border-2 border-white"
            />
          ))}
        </div>
        <div className="flex flex-col">
          <p>{`+${users.length} Utilisateurs`}</p>
          <p>Voir les avis</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
