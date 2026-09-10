import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditIcon, MoveIcon } from "./icons";
import type { AacButton } from "../types";

interface Props {
  button: AacButton;
  editMode: boolean;
  onActivate: (button: AacButton) => void;
  onEdit?: (button: AacButton) => void;
}

/** The visual contents shared between the real grid tile and the floating drag preview. */
export function ButtonTileContent({ button }: { button: AacButton }) {
  const iconSrc = button.iconUpload
    ? `/uploads/${button.iconUpload}`
    : button.iconId
      ? `/icons/${button.iconId}.png`
      : null;

  return (
    <>
      {iconSrc && <img className="aac-tile__icon" src={iconSrc} alt="" />}
      <span className="aac-tile__label">{button.label}</span>
    </>
  );
}

export default function ButtonTile({ button, editMode, onActivate, onEdit }: Props) {
  const isFolder = button.category === "folder";

  // A dedicated drag handle (the Move button below), rather than the whole
  // tile, is what dnd-kit's docs recommend whenever a draggable element also
  // needs its own tap/click behavior — trying to tell "tap", "tap to edit",
  // and "drag" apart on one element via timers was fragile in practice.
  // setNodeRef/transform stay on the outer wrapper so the tile and its
  // controls move together as one unit during reordering; only the handle
  // gets the sensor's pointer-down listeners.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: button.id,
    disabled: !editMode,
  });

  function handleTileClick() {
    // Folders always navigate on tap, even while editing, so nested boards
    // stay reachable — editing a folder button itself goes through the Edit
    // control below instead. Non-folder tiles only respond to a tap outside
    // Edit Mode (to speak); editing them is also via the Edit control.
    if (isFolder || !editMode) onActivate(button);
  }

  return (
    <div
      ref={setNodeRef}
      // Folders are drop targets, not reorder slots: dnd-kit's sort strategy
      // otherwise shifts every item's position — folders included — to
      // preview where the dragged tile would land, which makes a folder
      // slide out from under the very drop you're aiming for. Skipping the
      // transform keeps folders stationary; they can still be picked up and
      // moved themselves via their own Move handle, dimming in place while
      // the DragOverlay clone shows the movement instead.
      style={isFolder ? undefined : { transform: CSS.Transform.toString(transform), transition }}
      className={`aac-tile-wrapper${isDragging ? " aac-tile-wrapper--dragging" : ""}`}
    >
      <button
        type="button"
        className={`aac-tile aac-tile--${button.category}${editMode ? " aac-tile--editable" : ""}`}
        onClick={handleTileClick}
      >
        <ButtonTileContent button={button} />
      </button>
      {editMode && (
        <div className="aac-tile__controls">
          <button
            type="button"
            className="aac-tile__control-btn aac-tile__control-btn--edit"
            onClick={() => onEdit?.(button)}
            aria-label={`Edit ${button.label}`}
          >
            <EditIcon className="aac-tile__control-icon" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="aac-tile__control-btn aac-tile__control-btn--move"
            aria-label={`Move ${button.label}`}
            {...attributes}
            {...listeners}
          >
            <MoveIcon className="aac-tile__control-icon" />
            <span>Move</span>
          </button>
        </div>
      )}
    </div>
  );
}
