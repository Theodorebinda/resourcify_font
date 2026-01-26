"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";

// const ThemeToggleButton = styled.button`
//   color: ${(props) => props.theme.text};
//   cursor: pointer;
//   font-size:40
//   transition: all 0.25s linear;
// `;

// interface NavigationProps {
//   className?: string; // Add this line
//   toggleTheme?: () => void;
//   currentTheme?: string;
// }

export const Navigation = () =>
  //   {
  //   className,
  //   toggleTheme,
  //   currentTheme,
  // }: NavigationProps
  {
    const [isScrolled, setIsScrolled] = useState(false);
    const { token } = useAuthStore();

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);
    return (
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 mt-10  max-w-7xl mx-auto  r rounded-full z-20 ",
          { "bg-[#1c1d22] ": isScrolled }
        )}
      >
        <div className=" items-center justify-between p-5 md:flex hidden  max-w-7xl mx-auto">
          <div className="">
            <p>Logo</p>
          </div>

          <div className="flex justify-between items-center w-1/5 ">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            {token ? (
              <div className="avatar">
                <p>Avatar</p>
              </div>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>
        </div>
      </header>
    );
  };
