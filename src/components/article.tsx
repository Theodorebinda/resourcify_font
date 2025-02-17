import Image from "next/image";
import React, { useState } from "react";
import CustomSelectStart from "../ui/selectStart";
import { MessageSquareTextIcon } from "lucide-react";
import CustomReaction from "../ui/customReaction";

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
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState<{ [key: string]: number }>(
    {}
  );

  const handleReaction = (reaction: string) => {
    console.log("Réaction sélectionnée :", reaction);

    // Si la réaction est déjà sélectionnée, on la désélectionne et on décrémente le compteur
    if (selectedReaction === reaction) {
      setSelectedReaction(null);
      setReactionCount((prev) => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) - 1,
      }));
    } else {
      // Si une autre réaction était déjà sélectionnée, on décrémente son compteur
      if (selectedReaction) {
        setReactionCount((prev) => ({
          ...prev,
          [selectedReaction]: (prev[selectedReaction] || 0) - 1,
        }));
      }

      // On sélectionne la nouvelle réaction et on incrémente son compteur
      setSelectedReaction(reaction);
      setReactionCount((prev) => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) + 1,
      }));
    }
  };

  return (
    <article className="border border-default rounded-lg p-4 shadow-md mb-4 bg-[#0d1117]">
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
        <div className="flex border-b border-default pb-2 justify-between items-center">
          <h2 className="text-lg font-bold">{title}</h2>
          <CustomSelectStart />
        </div>
        <p className="text-gray-300 py-4">{content}</p>
      </div>
      <div className="flex justify-between mt-4">
        <div className="flex justify-start items-center">
          <CustomReaction onReact={handleReaction} />
          {selectedReaction && (
            <span
              onClick={() => handleReaction(selectedReaction)}
              className="ml-2 bg-[#152a45] px-1 rounded text-slate-300"
            >
              {selectedReaction} {reactionCount[selectedReaction] || 0}
            </span>
          )}
        </div>
        <button className="text-white">
          <MessageSquareTextIcon size={20} width={20} strokeWidth={0.8} />
        </button>
      </div>
    </article>
  );
};

export default Article;
