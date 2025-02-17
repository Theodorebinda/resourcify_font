import React from "react";
import Image from "next/image";

interface ArticleDetailProps {
  title: string;
  content: string;
  author: string;
  date: string;
  avatarUrl: string;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({
  title,
  content,
  author,
  date,
  avatarUrl,
}) => {
  return (
    <div className="border border-default rounded-lg p-4 shadow-md mb-4 bg-[#0d1117]">
      <div className="flex justify-start items-center gap-2 mr-4 mb-4">
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
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-gray-300 py-4">{content}</p>
    </div>
  );
};

export default ArticleDetail;
