import { HelloMessage } from "@/src/types/hello";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fallbackHello: HelloMessage = {
  title: "Resourcify",
  message:
    "Partage de ressources entre passionnés de lecture et d'apprentissage.",
  status: 200,
  image: "/images/download.svg",
};

type HelloApiPayload = Partial<HelloMessage> & {
  titre?: string;
};

export const fetchHello = async (): Promise<HelloMessage> => {
  if (!API_BASE_URL) {
    return fallbackHello;
  }

  const response = await fetch(`${API_BASE_URL}/`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return fallbackHello;
  }

  const payload = (await response.json()) as HelloApiPayload;

  return {
    title: payload.title ?? payload.titre ?? fallbackHello.title,
    message: payload.message ?? fallbackHello.message,
    status: payload.status ?? fallbackHello.status,
    image: payload.image ?? fallbackHello.image,
  };
};
