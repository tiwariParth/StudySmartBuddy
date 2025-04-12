import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface NoteProps {
  note: {
    id: string;
    content: string;
  };
  handleDelete: (id: string) => void;
}

const Note: React.FC<NoteProps> = ({ note, handleDelete }) => {
  return (
    <div className="relative p-4 border rounded-md">
      <p>{note.content}</p>
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 rounded-full p-2 flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(note.id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Note;