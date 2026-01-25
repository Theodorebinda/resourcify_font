import Image from "next/image";
import { useState } from "react";

import { useArticles } from "@/hooks/use-articles";
import { useDocuments } from "@/hooks/use-documents";
import { ResourceCategory } from "@/types/resource";

import PopularArticles from "./postePopulars";
import TutorielsList from "./tutoriels";

const ResourceSection = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory>("All categories");
  const {
    data: articles = [],
    isLoading: articlesLoading,
    isError: articlesError,
  } = useArticles();
  const {
    data: documentsByCategory,
    isLoading: documentsLoading,
    isError: documentsError,
  } = useDocuments();

  const categories =
    (documentsByCategory &&
      (Object.keys(documentsByCategory) as ResourceCategory[])) || [];
  const documents = documentsByCategory?.[selectedCategory] ?? [];

  const isLoading = articlesLoading || documentsLoading;
  const hasError = articlesError || documentsError;

  return (
    <div className="flex justify-between gap-6 w-full ">
      <div className="w-3/5 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Derniers Articles</h2>
        {isLoading && <p>Chargement des articles...</p>}
        {hasError && (
          <p className="text-red-500">
            Impossible de charger les ressources pour le moment.
          </p>
        )}
        {!isLoading &&
          !hasError &&
          articles.map((article) => (
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
        <div className="mt-8">
          <PopularArticles />
        </div>
      </div>
      <div className="w-1/3">
        <h2 className="text-2xl font-bold mb-4">Documents</h2>
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4 flex-wrap ">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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
          <div className="flex flex-col gap-4 justify-between h-[30vh]">
            <div className="flex justify-between flex-wrap gap-2">
              {documents.slice(0, 4).map((doc) => (
                <Image
                  width={90}
                  height={100}
                  src={doc.thumbnail}
                  key={doc.id}
                  className="mb-2"
                  alt={doc.title}
                />
              ))}
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white font-medium p-1 text-xs rounded hover:bg-blue-600 transition duration-200">
                Plus de livre
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
