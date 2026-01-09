import { Article } from "@/src/types/article";
import { DocumentAsset, ResourceCategory } from "@/src/types/resource";

const fallbackArticles: Article[] = [
  {
    id: "article-1",
    title: "Algorithme et programmation",
    summary:
      "Découvrir les bases de l'algorithmique et les meilleures pratiques pour débuter en développement.",
    author: "Alice Martin",
    date: "2023-10-01",
  },
  {
    id: "article-2",
    title: "Concevoir des interfaces accessibles",
    summary:
      "Un guide concret pour améliorer l’accessibilité et l’expérience utilisateur dans vos produits.",
    author: "Bob Leroy",
    date: "2023-11-12",
  },
];

const fallbackDocuments: Record<ResourceCategory, DocumentAsset[]> = {
  "All categories": [
    {
      id: "doc-1",
      category: "All categories",
      title: "Réfléchissez et devenez riche",
      thumbnail: "/images/download.svg",
    },
    {
      id: "doc-2",
      category: "All categories",
      title: "Père riche, père pauvre",
      thumbnail: "/images/bg_04.png",
    },
    {
      id: "doc-3",
      category: "All categories",
      title: "Algorithme et programmation",
      thumbnail: "/images/window.svg",
    },
    {
      id: "doc-4",
      category: "All categories",
      title: "Le plus grand homme de Babylon",
      thumbnail: "/images/globe.svg",
    },
  ],
  Category1: [
    {
      id: "doc-5",
      category: "Category1",
      title: "Productivité pour développeurs",
      thumbnail: "/images/globe.svg",
    },
  ],
  Category2: [
    {
      id: "doc-6",
      category: "Category2",
      title: "Design systems",
      thumbnail: "/images/window.svg",
    },
  ],
  Category3: [
    {
      id: "doc-7",
      category: "Category3",
      title: "Web performance",
      thumbnail: "/images/download.svg",
    },
  ],
  Category4: [
    {
      id: "doc-8",
      category: "Category4",
      title: "UI Patterns",
      thumbnail: "/images/bg_04.png",
    },
  ],
};

export const fetchArticles = async (): Promise<Article[]> => {
  // Replace with real API call when backend is ready
  return fallbackArticles;
};

export const fetchDocuments = async (): Promise<
  Record<ResourceCategory, DocumentAsset[]>
> => {
  // Replace with real API call when backend is ready
  return fallbackDocuments;
};
