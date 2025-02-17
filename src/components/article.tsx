import Image from "next/image";
import React from "react";

interface ArticleProps {
  title: string;
  content: string;
  author: string;
  date: string;
  avatarUrl: string;
}

const Article: React.FC<ArticleProps> = ({
  title,
  content,
  author,
  date,
  avatarUrl,
}) => {
  return (
    <article className="border border-default rounded-lg p-4 shadow-md mb-4 bg-[#0d1117]">
      {" "}
      <div className="flex justify-start items-center gap-2 mr-4 mb-8">
        <Image
          src={avatarUrl}
          alt={author}
          className="rounded-full"
          width={40}
          height={40}
        />
        <div className="flex flex-col justify-between items-start">
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="bg-[#151b23] p-2 rounded-lg">
        <h2 className="text-lg font-bold border-b  border-default bord pb-2">
          {title}
        </h2>
        <p className="text-gray-300 py-4">{content}</p>
      </div>
    </article>
  );
};

export default Article;
