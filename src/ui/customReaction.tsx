import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile } from "lucide-react";

interface CustomReactionProps {
  onReact: (reaction: string) => void;
}

const CustomReaction: React.FC<CustomReactionProps> = ({ onReact }) => {
  const reactions = ["👍", "👎", "❤️", "🙏", "😂", "😕", "😥", "👀", "🚀"];

  return (
    <div className="flex space-x-2 cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="rounded-full p border-default">
          <Smile size={20} strokeWidth={0.8} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex bg-[#0d1117]  ">
          {reactions.map((reaction) => (
            <DropdownMenuItem
              key={reaction}
              onClick={() => onReact(reaction)}
              className="focus:bg-[#313840] text-lg "
            >
              {reaction}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomReaction;
