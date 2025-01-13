import { useState } from "react";

const ResourceSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const articles = [
    {
      id: 1,
      title: "Article 1",
      summary: "Résumé de l'article 1",
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

  const documents = {
    All: ["Document A", "Document B", "Document C"],
    Category1: ["Document D", "Document E"],
    Category2: ["Document F", "Document G"],
  };

  return (
    <div className="flex justify-between gap-4 w-full px-5">
      <div className="w-3/4">
        <h2 className="text-2xl font-bold">Articles</h2>
        {articles
          //   .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((article) => (
            <div key={article.id} className="mb-4">
              <h3 className="font-semibold">{article.title}</h3>
              <p>{article.summary}</p>
              <p>
                <a
                  href={`/profile/${article.author}`}
                  className="text-blue-500"
                >
                  {article.author}
                </a>{" "}
                - {new Date(article.date).toLocaleDateString()}
              </p>
            </div>
          ))}
      </div>
      <div className="w-1/4">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex flex-col">
          <div className="flex space-x-4 mb-4">
            {Object.keys(documents).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-2 rounded ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div>
            pppp
            {/* {documents[selectedCategory].map((doc, index) => (
              <p key={index} className="mb-2">
                {doc}
              </p>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSection;
