// // import { Typography } from "@/ui/components/typography/typography";
// // import styled from "styled-components";
// // import Link from "next/link";
// // import { ActiveLink } from "./activeLink";
// // import clsx from "clsx";
// // import { MainRoutes } from "@/lib/pageRoutes/pageRoutes";
// // import { Container } from "@/ui/components/container/container";
// // import {
// //   Sheet,
// //   SheetContent,
// //   SheetDescription,
// //   SheetFooter,
// //   SheetHeader,
// //   SheetTrigger,
// // } from "@/components/ui/sheet";
// // import { FaMoon } from "react-icons/fa6";
// // import { FaSun } from "react-icons/fa";
// // import { RiMenu2Line } from "react-icons/ri";
// // import LinkMediaSocial from "@/components/linkSocialMedia";
// // import { useEffect, useState } from "react";

// export const ThemeToggleButton = styled.button`
//   color: ${(props) => props.theme.text};
//   cursor: pointer;
//   transition: all 0.25s linear;
// `;

// interface Props {
//   className?: string;
//   toggleTheme?: () => void;
//   currentTheme?: string;
// }

// export const MobileNavigation = ({
//   toggleTheme,
//   currentTheme,
//   className,
// }: Props) => {
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
//       className={clsx("fixed top-0 left-0 right-0 min-w-full ", className, {
//         "shadow-md": isScrolled,
//       })}
//     >
//       <Container
//         className={`${
//           currentTheme === "light" ? "bg-white" : "bg-[#1c1917]"
//         }  flex flex-row items-center w-full justify-between px-4 py-8 h-[10vh]`}
//       >
//         <Container className="flex justify-start items-center gap-3">
//           <Link
//             href="/"
//             className="flex justify-start items-center"
//             aria-label={"logo"}
//           >
//             <div className="bg-[#b2d2fa] hover:bg-[#5182be] w-6 rounded-full h-6"></div>
//             {currentTheme === "light" ? (
//               <Typography
//                 component="p"
//                 className="px-1 text-xl font-normal hover:text-[#464646]"
//               >
//                 T.Samba
//               </Typography>
//             ) : (
//               <Typography
//                 component="p"
//                 className="px-1 text-xl font-normal hover:text-white"
//               >
//                 T.Samba
//               </Typography>
//             )}
//           </Link>
//           <ThemeToggleButton onClick={toggleTheme} aria-label={"theme"}>
//             {currentTheme === "light" ? (
//               <FaMoon size={30} className=" hover:fill-[#464646]" />
//             ) : (
//               <FaSun size={30} className=" hover:fill-[#ffffff]" />
//             )}
//           </ThemeToggleButton>
//         </Container>

//         <Sheet>
//           <SheetTrigger>
//             <RiMenu2Line size={32} aria-label={"menu"} />
//           </SheetTrigger>
//           <SheetContent
//             className={`${
//               currentTheme === "light" ? "bg-white" : "bg-[#222020]"
//             } w-[90vw] `}
//           >
//             <SheetDescription className="h-full flex justify-between flex-col">
//               <nav className=" flex flex-col justify-between items-center">
//                 <Container className="w-full flex flex-col">
//                   {MainRoutes.map((route) => (
//                     <Typography
//                       key={route.title!}
//                       variant="body-base"
//                       component="p"
//                       className="pt-10 my-auto "
//                     >
//                       <ActiveLink href={route.baseUrl!}>
//                         {route.title}
//                       </ActiveLink>
//                     </Typography>
//                   ))}
//                 </Container>
//               </nav>
//               <Container className="flex flex-col justify-start gap-2">
//                 <Typography className="font-semibold" variant="body-base">
//                   Contact
//                 </Typography>
//                 <span>
//                   Email :
//                   <a href="mailto:theodorebinda@gmail.com">
//                     {" "}
//                     theodorebinda@gmail.com
//                   </a>
//                 </span>
//                 <span>
//                   Tel :<a href="tel:+243894594411"> +243 89 459 4411</a>
//                 </span>
//               </Container>

//               <LinkMediaSocial
//                 className="gap-24 justify-start"
//                 currentTheme={currentTheme}
//               />
//             </SheetDescription>
//           </SheetContent>
//         </Sheet>
//       </Container>
//     </header>
//   );
// };
