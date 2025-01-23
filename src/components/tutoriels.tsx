// import { useState, useEffect } from "react";

export const TutorielsList = () => {
  //   const [tutoriels, setTutoriels] = useState([]);

  //   useEffect(() => {
  //     const fetchTutoriels = async () => {
  //       try {
  //         const res = await fetch("http://localhost:3000/tutoriels");
  //         if (!res.ok) {
  //           throw new Error(`HTTP error! status: ${res.status}`);
  //         }
  //         const data = await res.json();
  //         setTutoriels(data);
  //       } catch (error) {
  //         console.error("Error fetching tutoriels:", error);
  //       }
  //     };

  //     fetchTutoriels();
  //   }, []);
  const tutoriels = [
    { id: 1, title: "Tutoriel 1", summary: "Résumé du tutoriel 1" },
    { id: 2, title: "Tutoriel 2", summary: "Résumé du tutoriel 2" },
    { id: 3, title: "Tutoriel 3", summary: "Résumé du tutoriel 3" },
  ];

  return (
    <div className="tutoriels-list">
      <h2 className="text-2xl font-bold mb-4">Tutoriels Disponibles</h2>
      {tutoriels.length > 0 ? (
        tutoriels.map((tutoriel) => (
          <div key={tutoriel.id} className="mb-4">
            <h3 className="font-semibold">{tutoriel.title}</h3>
            <p>{tutoriel.summary}</p>
            <p>
              <a href={`/tutoriel/${tutoriel.id}`} className="text-blue-500">
                Voir Détails
              </a>
            </p>
          </div>
        ))
      ) : (
        <p>Aucun tutoriel disponible.</p>
      )}
    </div>
  );
};

export default TutorielsList;
