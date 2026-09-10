import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Board from "./components/Board";
import ButtonEditorModal, { type ButtonFormData } from "./components/ButtonEditorModal";
import { ButtonTileContent } from "./components/ButtonTile";
import SentenceStrip from "./components/SentenceStrip";
import { BackIcon, HomeIcon } from "./components/icons";
import {
  createButton,
  createFolderBoard,
  deleteBoard,
  deleteButton,
  fetchBoard,
  moveButton,
  renameBoard,
  reorderBoard,
  updateButton,
  type ButtonInput,
} from "./api";
import { HOME_BOARD_ID } from "./data/boardConstants";
import { speak } from "./speech";
import type { AacBoard, AacButton } from "./types";
import "./App.css";

const HEADER_BACK_DROP_ID = "header-back";

type EditorState =
  | { mode: "edit"; button: AacButton }
  | { mode: "create"; forcedCategory?: "folder" }
  | null;

interface Props {
  /** Whether this screen allows editing buttons/boards. Kept off the main "/" route. */
  editable: boolean;
}

const EDIT_ENTRY_LONG_PRESS_MS = 1500;

/** The "← Back" nav button, doubling as a drop zone to move a dragged button up one level. */
function BackNavButton({
  disabled,
  dropDisabled,
  onClick,
}: {
  disabled: boolean;
  dropDisabled: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: HEADER_BACK_DROP_ID, disabled: dropDisabled });
  return (
    <button
      ref={setNodeRef}
      className={`aac-nav-button aac-nav-button--icon-only${isOver ? " aac-nav-button--drop-target" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label="Back"
    >
      <BackIcon className="aac-nav-button__icon" />
    </button>
  );
}

function BoardScreen({ editable }: Props) {
  const navigate = useNavigate();
  const [stack, setStack] = useState<string[]>([HOME_BOARD_ID]);
  const [board, setBoard] = useState<AacBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [draggingButton, setDraggingButton] = useState<AacButton | null>(null);
  const [sentence, setSentence] = useState<AacButton[]>([]);
  const titlePressTimer = useRef<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const currentBoardId = stack[stack.length - 1];

  function handleTitlePointerDown() {
    // Hidden entry point into Edit Mode: the installed app has no address
    // bar, and iOS Safari doesn't support manifest "shortcuts", so this is
    // the only way in once the app is on a home screen. Deliberately
    // undiscoverable to a child, but reliable for a caregiver who knows it.
    if (editable) return;
    titlePressTimer.current = window.setTimeout(() => {
      // replace, not push: keeps /edit out of browser history so back/swipe
      // navigation can never land back in Edit Mode.
      navigate("/edit", { replace: true });
    }, EDIT_ENTRY_LONG_PRESS_MS);
  }

  function clearTitlePress() {
    if (titlePressTimer.current !== null) {
      window.clearTimeout(titlePressTimer.current);
      titlePressTimer.current = null;
    }
  }

  function reloadBoard() {
    fetchBoard(currentBoardId)
      .then((loaded) => setBoard(loaded))
      .catch(() => setError(`Could not load board "${currentBoardId}"`));
  }

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchBoard(currentBoardId)
      .then((loaded) => {
        if (!cancelled) setBoard(loaded);
      })
      .catch(() => {
        if (!cancelled) setError(`Could not load board "${currentBoardId}"`);
      });
    return () => {
      cancelled = true;
    };
  }, [currentBoardId]);

  function handleActivate(button: AacButton) {
    if (button.category === "folder" && button.target) {
      // Folders always navigate on tap, even while editing, so nested
      // boards stay reachable — editing a folder button itself goes through
      // its own Edit control instead. Speaking the category name (outside
      // Edit Mode) reinforces vocabulary the same way any other tile does.
      // Folders are navigation, not vocabulary, so they don't join the
      // sentence strip the way a word tile does below.
      if (!editable) speak(button.speak ?? button.label);
      setStack((prev) => [...prev, button.target as string]);
      return;
    }
    if (!editable) {
      speak(button.speak ?? button.label);
      setSentence((prev) => [...prev, button]);
    }
  }

  function handleEdit(button: AacButton) {
    setEditor({ mode: "edit", button });
  }

  function handleSpeakSentence() {
    if (sentence.length === 0) return;
    speak(sentence.map((b) => b.speak ?? b.label).join(" "));
  }

  function handleClearSentence() {
    setSentence([]);
  }

  function handleRemoveSentenceWord(index: number) {
    setSentence((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(data: ButtonFormData) {
    let target: string | null = null;

    if (data.category === "folder") {
      const existingTarget =
        editor?.mode === "edit" && editor.button.category === "folder"
          ? editor.button.target
          : undefined;

      if (existingTarget) {
        target = existingTarget;
        await renameBoard(existingTarget, data.label);
      } else {
        const newBoard = await createFolderBoard(data.label);
        target = newBoard.id;
      }
    }

    const payload: ButtonInput = { ...data, target };

    if (editor?.mode === "edit") {
      await updateButton(editor.button.id, payload);
    } else {
      await createButton(currentBoardId, payload);
    }
    setEditor(null);
    reloadBoard();
  }

  async function handleDelete() {
    if (editor?.mode !== "edit") return;
    const { button } = editor;
    await deleteButton(button.id);
    if (button.category === "folder" && button.target) {
      // Best-effort: the backend refuses to delete the home board or a board
      // still linked from another folder button, which is fine to ignore here.
      await deleteBoard(button.target).catch(() => {});
    }
    setEditor(null);
    reloadBoard();
  }

  function goHome() {
    setStack([HOME_BOARD_ID]);
  }

  function goBack() {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingButton(board?.buttons.find((b) => b.id === event.active.id) ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingButton(null);
    const { active, over } = event;
    if (!board || !over || active.id === over.id) return;

    const activeButton = board.buttons.find((b) => b.id === active.id);
    if (!activeButton) return;

    if (over.id === HEADER_BACK_DROP_ID) {
      const parentBoardId = stack[stack.length - 2];
      if (!parentBoardId) return;
      setBoard({ ...board, buttons: board.buttons.filter((b) => b.id !== active.id) });
      try {
        await moveButton(activeButton.id, parentBoardId);
      } catch {
        reloadBoard();
      }
      return;
    }

    const overButton = board.buttons.find((b) => b.id === over.id);
    if (overButton?.category === "folder" && overButton.target) {
      setBoard({ ...board, buttons: board.buttons.filter((b) => b.id !== active.id) });
      try {
        await moveButton(activeButton.id, overButton.target);
      } catch {
        reloadBoard();
      }
      return;
    }

    const oldIndex = board.buttons.findIndex((b) => b.id === active.id);
    const newIndex = board.buttons.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(board.buttons, oldIndex, newIndex);
    setBoard({ ...board, buttons: reordered });
    try {
      await reorderBoard(currentBoardId, reordered.map((b) => b.id));
    } catch {
      reloadBoard();
    }
  }

  const isHome = currentBoardId === HOME_BOARD_ID;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="aac-app">
        <header className={`aac-header${editable ? " aac-header--edit" : ""}`}>
          <BackNavButton disabled={isHome} dropDisabled={!editable || isHome} onClick={goBack} />
          <h1
            className="aac-title"
            onPointerDown={handleTitlePointerDown}
            onPointerUp={clearTitlePress}
            onPointerLeave={clearTitlePress}
            onPointerCancel={clearTitlePress}
          >
            {editable ? `Edit Mode (${board?.title ?? "..."})` : (board?.title ?? "...")}
          </h1>
          <div className="aac-header-right">
            {editable && (
              <Link className="aac-nav-button" to="/" replace>
                Exit Editing
              </Link>
            )}
            <button
              className="aac-nav-button aac-nav-button--icon-only"
              onClick={goHome}
              disabled={isHome}
              aria-label="Home"
            >
              <HomeIcon className="aac-nav-button__icon" />
            </button>
          </div>
        </header>
        {!editable && (
          <SentenceStrip
            words={sentence}
            onRemoveWord={handleRemoveSentenceWord}
            onSpeak={handleSpeakSentence}
            onClear={handleClearSentence}
          />
        )}
        <main>
          {error && <p className="aac-error">{error}</p>}
          {!error && board && board.id === currentBoardId && (
            <Board
              board={board}
              editMode={editable}
              onActivate={handleActivate}
              onEdit={editable ? handleEdit : undefined}
              onAddButton={() => setEditor({ mode: "create" })}
              onAddFolder={() => setEditor({ mode: "create", forcedCategory: "folder" })}
            />
          )}
        </main>
        {editable && editor && (
          <ButtonEditorModal
            button={editor.mode === "edit" ? editor.button : null}
            forcedCategory={editor.mode === "create" ? editor.forcedCategory : undefined}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setEditor(null)}
          />
        )}
        <DragOverlay>
          {draggingButton && (
            <div className={`aac-tile aac-tile--${draggingButton.category}`}>
              <ButtonTileContent button={draggingButton} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default BoardScreen;
