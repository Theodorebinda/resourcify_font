import React from "react";

interface ArticleProps {
  title: string;
  content: string;
  author: string;
  date: string;
}

const Article: React.FC<ArticleProps> = ({ title, content, author, date }) => {
  return (
    <article className="border rounded-lg p-4 shadow-md mb-4 bg-[#0d1117]">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-500 text-sm mb-2">{`By ${author} on ${date}`}</p>
      <div className="text-gray-700">{content}</div>
    </article>
  );
};

export default Article;
