"use client";
import ResourceSection from "@/src/components/ressourceSections";

export default function Home() {
  const users = [
    {
      id: 1,
      name: "User 1",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      id: 2,
      name: "User 2",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      id: 3,
      name: "User 2",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      id: 4,
      name: "User 2",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      id: 5,
      name: "User 2",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      id: 6,
      name: "User 2",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    // ... more users ...
  ];
  return (
    <div className="absolute flex flex-col gap-10">
      <div className=" mx-56 flex flex-col gap-8  text-center mt-18  ">
        <h1 className="text-5xl font-bold">
          {
            "Partagez, collaborez et accédez à tout documents en toute simplicité."
          }
        </h1>
        <p>
          {
            "Resourcify vous donne l'occasion non seulement de partager vos connaissances et ressources mais egalement egalement de trouver tout ceque vous desirez."
          }
        </p>
        <div className="flex items-center justify-center gap-2 ">
          <div className="flex flex-row space-x-[-20px]">
            {users.map((user) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <div className="flex flex-col">
            <p>{`+${users.length} Utilisateurs`}</p>
            <p>Voir les avis</p>
          </div>
        </div>
      </div>
      <ResourceSection />
    </div>
  );
}
