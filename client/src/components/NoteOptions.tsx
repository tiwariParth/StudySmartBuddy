import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface DropdownMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Redesigned delete button */}
        <DropdownMenuItem 
          onClick={onDelete} 
          className="cursor-pointer mt-1 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white transition-colors duration-200"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};