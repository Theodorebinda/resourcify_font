// import { useState, useEffect } from "react";

export const PopularArticles = () => {
  //   const [popularArticles, setPopularArticles] = useState([]);

  //   useEffect(() => {
  //     const fetchPopularArticles = async () => {
  //       try {
  //         const res = await fetch("http://localhost:3000/popular-articles");
  //         if (!res.ok) {
  //           throw new Error(`HTTP error! status: ${res.status}`);
  //         }
  //         const data = await res.json();
  //         setPopularArticles(data);
  //       } catch (error) {
  //         console.error("Error fetching popular articles:", error);
  //       }
  //     };

  //     fetchPopularArticles();
  //   }, []);

  const popularArticles = [
    {
      id: 1,
      title: "Article 1",
      summary: "Résumé de l'article 1",
      author: "Auteur 1",
      date: "2023-01-01",
    },
    {
      id: 2,
      title: "Article 2",
      summary: "Résumé de l'article 2",
      author: "Auteur 2",
      date: "2023-02-01",
    },
    {
      id: 3,
      title: "Article 3",
      summary: "Résumé de l'article 3",
      author: "Auteur 3",
      date: "2023-03-01",
    },
  ];

  return (
    <div className="popular-articles">
      <h2 className="text-2xl font-bold mb-4">Articles Populaires</h2>
      {popularArticles.length > 0 ? (
        popularArticles.map((article) => (
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
        ))
      ) : (
        <p>Aucun article populaire disponible.</p>
      )}
    </div>
  );
};

export default PopularArticles;
