import React, { useState } from "react";

const InputSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    // Logic for handling search can be added here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="flex items-center w-full fixed">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Rechercher..."
        className="p-2 border rounded w-[20vw]"
        style={{ backgroundColor: "#0d1117", color: "#ffffff" }}
      />
      <button
        onClick={handleSearch}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Search
      </button>
    </div>
  );
};

export default InputSearch;
