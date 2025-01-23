"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

// import styled from "styled-components";
// import Link from "next/link";
// import clsx from "clsx";
// import { useEffect, useState } from "react";

// // const ThemeToggleButton = styled.button`
// //   color: ${(props) => props.theme.text};
// //   cursor: pointer;
// //   font-size:40
// //   transition: all 0.25s linear;
// // `;

// interface Props {
//   className?: string;
//   toggleTheme?: () => void;
//   currentTheme?: string;
// }

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false); // État pour suivre le défilement

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // mise à jour l'état en fonction de la position de défilement
    };

    window.addEventListener("scroll", handleScroll); //  l'écouteur d'événements

    return () => {
      window.removeEventListener("scroll", handleScroll); // Nettoie l'écouteur d'événements
    };
  }, []);
  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 mt-10  mx-36  r rounded-full z-20 ",

        { "bg-[#1c1d22] ": isScrolled }
      )}
    >
      <div className=" items-center justify-between p-5 md:flex hidden ">
        <div className="">
          <p>Logo</p>
        </div>

        <div className="flex justify-between items-center w-1/5 ">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </header>
  );
};
