import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { AacBoard, AacButton } from "../types";
import AddButtonTile from "./AddButtonTile";
import ButtonTile from "./ButtonTile";

interface Props {
  board: AacBoard;
  editMode: boolean;
  onActivate: (button: AacButton) => void;
  onEdit?: (button: AacButton) => void;
  onAddButton: () => void;
  onAddFolder: () => void;
}

export default function Board({ board, editMode, onActivate, onEdit, onAddButton, onAddFolder }: Props) {
  return (
    <div className="aac-grid">
      <SortableContext items={board.buttons.map((b) => b.id)} strategy={rectSortingStrategy}>
        {board.buttons.map((button) => (
          <ButtonTile
            key={button.id}
            button={button}
            editMode={editMode}
            onActivate={onActivate}
            onEdit={onEdit}
          />
        ))}
      </SortableContext>
      {editMode && (
        <>
          <AddButtonTile label="Add button" onClick={onAddButton} />
          <AddButtonTile label="Add group" onClick={onAddFolder} />
        </>
      )}
    </div>
  );
}
