import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarIcon } from "lucide-react";

const CustomSelectStart: React.FC = ({}) => {
  return (
    <Select>
      <SelectTrigger className="w-[100px] border-default flex flex-row">
        <SelectValue placeholder="Start" className=" flex flex-row" />
      </SelectTrigger>
      <SelectContent className="flex bg-[#0d1117] text-inherit border-default">
        <SelectItem value="start-0" className="flex">
          <StarIcon size={15} />
        </SelectItem>
        <SelectItem value="start-1" className="flex">
          <StarIcon size={15} color="yellow" fill="yellow" />
        </SelectItem>
        <SelectItem value="start-2" className="flex">
          <div className="flex">
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
          </div>
        </SelectItem>
        <SelectItem value="start-3">
          <div className="flex">
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
          </div>
        </SelectItem>
        <SelectItem value="start-4" className="flex">
          <div className="flex">
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
          </div>
        </SelectItem>
        <SelectItem value="start-5" className="flex">
          <div className="flex">
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
            <StarIcon size={15} color="yellow" fill="yellow" />
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CustomSelectStart;
