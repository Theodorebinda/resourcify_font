import { clsx } from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from "../components/ui/sheet";
import { Sheet } from "lucide-react";
// import styled from "styled-components";

// export const ThemeToggleButton = styled.button`
//   color: ${(props) => props.theme.text};
//   cursor: pointer;
//   transition: all 0.25s linear;
// `;

interface Props {
  className?: string;
  toggleTheme?: () => void;
  currentTheme?: string;
}

export const MobileNavigation = ({
  //   toggleTheme,
  currentTheme,
  className,
}: Props) => {
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
      className={clsx("fixed top-0 left-0 right-0 min-w-full ", className, {
        "shadow-md": isScrolled,
      })}
    >
      <div
        className={`${
          currentTheme === "light" ? "bg-white" : "bg-[#1c1d22]"
        }  flex flex-row items-center w-full justify-between px-4 py-8 h-[10vh]`}
      >
        <div className="flex justify-start items-center gap-3">
          <Link
            href="/"
            className="flex justify-start items-center"
            aria-label={"logo"}
          >
            <div className="bg-[#b2d2fa] hover:bg-[#5182be] w-6 rounded-full h-6"></div>
            {currentTheme === "light" ? (
              <p className="px-1 text-xl font-normal hover:text-[#464646]">
                T.Samba
              </p>
            ) : (
              <p className="px-1 text-xl font-normal hover:text-white">
                T.Samba
              </p>
            )}
          </Link>
        </div>

        <Sheet>
          <SheetTrigger>
            {/* <RiMenu2Line size={32} aria-label={"menu"} /> */}
          </SheetTrigger>
          <SheetContent
            className={`${
              currentTheme === "light" ? "bg-white" : "bg-[#222020]"
            } w-[90vw] `}
          >
            <SheetDescription className="h-full flex justify-between flex-col">
              <nav className=" flex flex-col justify-between items-center">
                <p>Hello</p>
              </nav>

              <span>
                Email :
                <a href="mailto:theodorebinda@gmail.com">
                  {" "}
                  theodorebinda@gmail.com
                </a>
              </span>
              <span>
                Tel :<a href="tel:+243894594411"> +243 89 459 4411</a>
              </span>
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
