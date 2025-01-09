// "use client";
// import { Typography } from "@/ui/components/typography/typography";
// import styled from "styled-components";
// import Link from "next/link";
// import { ActiveLink } from "./activeLink";
// import { MainRoutes } from "@/lib/pageRoutes/pageRoutes";
// import { Container } from "@/ui/components/container/container";
// import clsx from "clsx";
// import { FaMoon } from "react-icons/fa6";
// import { FaSun } from "react-icons/fa";
// import LinkMediaSocial from "@/components/linkSocialMedia";
// import { useEffect, useState } from "react";

// const ThemeToggleButton = styled.button`
//   color: ${(props) => props.theme.text};
//   cursor: pointer;
//   font-size:40
//   transition: all 0.25s linear;
// `;

// interface Props {
//   className?: string;
//   toggleTheme?: () => void;
//   currentTheme?: string;
// }

// export const Navigation = ({ toggleTheme, currentTheme, className }: Props) => {
//   const isActive = () => {
//     if (toggleTheme) {
//       return;
//     }
//   };
//   const [isScrolled, setIsScrolled] = useState(false); // État pour suivre le défilement

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 0); // mise à jour l'état en fonction de la position de défilement
//     };

//     window.addEventListener("scroll", handleScroll); //  l'écouteur d'événements

//     return () => {
//       window.removeEventListener("scroll", handleScroll); // Nettoie l'écouteur d'événements
//     };
//   }, []);

//   return (
//     <header
//       className={clsx(
//         //  'text-primary-Default',
//         "fixed top-0 left-0 right-0 min-w-full   ",
//         className,
//         { "shadow-md": isScrolled }
//       )}
//     >
//       <Container
//         className={`${currentTheme === "light" ? "bg-white" : "bg-[#1c1917]"} `}
//       >
//         <Container className="mx-52 flex flex-row items-center w-ful justify-between   h-[7rem]">
//           <Link href="/" className="flex justify-between items-center">
//             <div className="bg-[#b2d2fa] hover:bg-[#5182be] w-6 rounded-full h-6"></div>
//             {currentTheme === "light" ? (
//               <Typography
//                 component="p"
//                 className="px-3  text-xl font-normal hover:text-[#000]"
//               >
//                 T.Samba
//               </Typography>
//             ) : (
//               <Typography
//                 component="p"
//                 className="px-3 ] text-xl font-normal hover:text-white"
//               >
//                 T.Samba
//               </Typography>
//             )}
//           </Link>
//           <nav className="flex items-center justify-between gap-10">
//             {MainRoutes.map((route) => (
//               <Typography
//                 key={route.title}
//                 variant="body-base"
//                 component="p"
//                 className=""
//               >
//                 {currentTheme === "light" ? (
//                   <ActiveLink
//                     href={route.baseUrl!}
//                     className="flex hover:text-[#000] focus:text-black "
//                   >
//                     {route.title}
//                   </ActiveLink>
//                 ) : (
//                   <ActiveLink
//                     href={route.baseUrl!}
//                     className="flex hover:text-[#fff]  focus:text-white"
//                   >
//                     {route.title}
//                   </ActiveLink>
//                 )}
//               </Typography>
//             ))}
//           </nav>
//           <Container className="flex justify-between items-center gap-10">
//             <LinkMediaSocial currentTheme={currentTheme} />
//             <ThemeToggleButton onClick={toggleTheme} aria-label={"theme"}>
//               {currentTheme === "light" ? (
//                 <FaMoon size={20} className=" hover:fill-[#464646]" />
//               ) : (
//                 <FaSun size={20} className=" hover:fill-[#ffffff]" />
//               )}
//             </ThemeToggleButton>
//           </Container>
//         </Container>
//       </Container>
//     </header>
//   );
// };
