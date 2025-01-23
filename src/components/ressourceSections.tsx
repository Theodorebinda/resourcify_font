import { useState } from "react";
import PopularArticles from "./postePopulars";
import TutorielsList from "./tutoriels";
// import { useStore } from "zustand";

// interface StoreState {
//   bears: number;
// }
const ResourceSection = () => {
  // Déclarer un type pour les catégories
  type Category =
    | "All categories"
    | "Category1"
    | "Category2"
    | "Category3"
    | "Category4";
  // const bears = useStore<StoreState>((state: { bears: number }) => state.bears);

  // Utiliser le type pour `selectedCategory`
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All categories");

  const articles = [
    {
      id: 1,
      title: "ALGORITHME ET PROGRAMMATION",
      summary:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor incididunt ut labore et dolore magna aliquy pas et accus tempus. Lorem ipsum dolor sit amet, consect",
      author: "Author 1",
      date: "2023-10-01",
    },
    {
      id: 2,
      title: "Article 2",
      summary: "Résumé de l'article 2",
      author: "Author 2",
      date: "2023-09-15",
    },
    // ... more articles
  ];

  const documents: Record<Category, string[]> = {
    "All categories": [
      "Document A",
      "Document B",
      "Document C",
      "Document D",
      "Document",
    ],
    Category1: [
      "Reflechissez et Devenez riche",
      "Le Plus grand Homme de Babylon",
      "Pere riche pere pauvre",
      "Chevre de ma mere",
    ],
    Category2: ["Document F", "Document G"],
    Category3: ["Document F", "Document G"],
    Category4: ["Document F", "Document G"],
  };

  return (
    <div className="flex justify-between gap-6 w-full px-5">
      <div className="w-3/5">
        <h2 className="text-2xl font-bold mb-4">Derniers Articles</h2>
        {articles.map((article) => (
          <div key={article.id} className="mb-4">
            <h3 className="font-semibold">{article.title}</h3>
            <p>{article.summary}</p>
            <p>
              <a href={`/profile/${article.author}`} className="text-blue-500">
                {article.author}
              </a>{" "}
              - {new Date(article.date).toLocaleDateString()}
            </p>
          </div>
        ))}
        <PopularArticles />
      </div>
      <div className="w-1/3">
        <h2 className="text-2xl font-bold mb-4">Documents</h2>
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4 flex-wrap ">
            {Object.keys(documents).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as Category)}
                className={`p-1 text-xs rounded ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white font-medium"
                    : "bg-gray-200 text-blue-900 font-medium"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div>
            {documents[selectedCategory].slice(0, 3).map((doc, index) => (
              <p key={index} className="mb-2">
                {doc}
              </p>
            ))}
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white font-medium p-1 text-xs rounded hover:bg-blue-600 transition duration-200">
                Voir Plus
              </button>
            </div>
          </div>
        </div>
        <TutorielsList />
      </div>
    </div>
  );
};

export default ResourceSection;
