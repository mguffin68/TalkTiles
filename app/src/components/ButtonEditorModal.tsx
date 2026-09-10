import { useState, type FormEvent } from "react";
import { CATEGORIES } from "../data/categories";
import IconPicker, { type IconValue } from "./IconPicker";
import type { AacButton, WordCategory } from "../types";

export interface ButtonFormData {
  label: string;
  speak: string | null;
  category: WordCategory;
  iconId: number | null;
  iconUpload: string | null;
}

interface Props {
  button: AacButton | null; // null = creating a new button
  /** Set when created via the "Add group" tile — locks the category to folder. */
  forcedCategory?: "folder";
  onSave: (data: ButtonFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export default function ButtonEditorModal({ button, forcedCategory, onSave, onDelete, onCancel }: Props) {
  const [label, setLabel] = useState(button?.label ?? "");
  const [speak, setSpeak] = useState(button?.speak ?? "");
  const [category, setCategory] = useState<WordCategory>(button?.category ?? forcedCategory ?? "noun");
  const isFolder = category === "folder";
  const [icon, setIcon] = useState<IconValue>({
    iconId: button?.iconId ?? null,
    iconUpload: button?.iconUpload ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        label: label.trim(),
        speak: speak.trim() || null,
        category,
        iconId: icon.iconId,
        iconUpload: icon.iconUpload,
      });
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  async function handleConfirmedDelete() {
    setSaving(true);
    try {
      await onDelete();
    } catch {
      setError("Could not delete this button.");
      setSaving(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="aac-modal-overlay" onClick={onCancel}>
      <form
        className="aac-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>{isFolder ? (button ? "Edit Group" : "New Group") : button ? "Edit Button" : "New Button"}</h2>

        <label className="aac-field">
          Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </label>

        <div className="aac-field">
          Icon (optional)
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <label className="aac-field">
          Spoken text (optional, defaults to label)
          <input
            type="text"
            value={speak}
            onChange={(e) => setSpeak(e.target.value)}
            placeholder={label || "same as label"}
          />
        </label>

        {!isFolder && (
          <label className="aac-field">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WordCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {isFolder && (
          <p className="aac-field-hint">
            {button?.category === "folder"
              ? "This group's board will be renamed to match the label."
              : "A new board will be created for this group, named after the label."}
          </p>
        )}

        {error && <p className="aac-error">{error}</p>}

        {confirmingDelete ? (
          <div className="aac-confirm-delete">
            <p>
              {button?.category === "folder"
                ? `Delete the "${button?.label}" group and everything inside it? This can't be undone.`
                : `Delete the "${button?.label}" button? This can't be undone.`}
            </p>
            <div className="aac-modal-actions">
              <button
                type="button"
                className="aac-modal-button"
                onClick={() => setConfirmingDelete(false)}
                disabled={saving}
              >
                Keep it
              </button>
              <button
                type="button"
                className="aac-modal-button aac-modal-button--danger"
                onClick={handleConfirmedDelete}
                disabled={saving}
              >
                Delete it
              </button>
            </div>
          </div>
        ) : (
          <div className="aac-modal-actions">
            {button && (
              <button
                type="button"
                className="aac-modal-button aac-modal-button--danger"
                onClick={() => setConfirmingDelete(true)}
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="aac-modal-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="aac-modal-button aac-modal-button--primary"
              disabled={saving}
            >
              Save
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
