import { useEffect, useState } from "react"; // Ajout de useEffect et useState

export default function Home() {
  const [services, setServices] = useState([]); // État pour stocker les utilisateurs

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:3000/"); // Remplacez par votre route API
      const data = await response.json();
      setServices(data); // Met à jour l'état avec les données récupérées
      console.log(data);
    };

    fetchUsers();
  }, []); // Le tableau vide signifie que l'effet s'exécute une seule fois après le premier rendu
  console.log(services);
}
