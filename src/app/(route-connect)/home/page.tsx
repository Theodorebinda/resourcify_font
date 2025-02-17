"use client";
import Article from "@/src/components/article";
import SidebarRight from "@/src/components/sideBarRight";
import React, { JSX } from "react";

function HomePage(): JSX.Element {
  const articleData = [
    {
      title: "Titre de l'article",
      content:
        "Ceci est le contenu de l'article. Il peut contenir plusieurs paragraphes et informations.",
      author: "Nom de l'auteur",
      date: "1 janvier 2023",
      avatarUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      title: "Titre de l'article",
      content:
        "Ceci est le contenu de l'article. Il peut contenir plusieurs paragraphes et informations.",
      author: "Nom de l'auteur",
      date: "1 janvier 2023",
      avatarUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      title: "Titre de l'article",
      content:
        "Ceci est le contenu de l'article. Il peut contenir plusieurs paragraphes et informations.",
      author: "Nom de l'auteur",
      date: "1 janvier 2023",
      avatarUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    {
      title: "Titre de l'article",
      content:
        "Ceci est le contenu de l'article. Il peut contenir plusieurs paragraphes et informations Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloremque facere exercitationem deleniti eos enim. Explicabo cupiditate quibusdam amet, sed repudiandae commodi ea esse ex aspernatur, aliquam perspiciatis. At, officiis nulla?",
      author: "Nom de l'auteur",
      date: "1 janvier 2023",
      avatarUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocKi7_sRkEisPwvp2TKaQQXOPC0DjsoGJ24BReynndwrm_7InhzT=s360-c-no",
    },
    // ... d'autres articles peuvent être ajoutés ici
  ];
  return (
    <div className="w-full  flex justify-between px-10 ">
      <div className="flex flex-col w-3/4 pr-10 ">
        {articleData.map((article, index) => (
          <Article
            key={index}
            title={article.title}
            content={article.content}
            author={article.author}
            date={article.date}
            avatarUrl={article.avatarUrl}
          />
        ))}
      </div>
      <div className="stocky  top-20  lg:block hidden w-1/3">
        <SidebarRight className="" />
      </div>
    </div>
  );
}

export default HomePage;
