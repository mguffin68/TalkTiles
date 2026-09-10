import { slugify } from "./slugify";
import type { AacBoard, AacButton, BoardSummary, IconSearchResult, WordCategory } from "./types";

export async function fetchBoard(id: string): Promise<AacBoard> {
  const res = await fetch(`/api/boards/${id}`);
  if (!res.ok) throw new Error(`Failed to load board "${id}"`);
  return res.json();
}

async function createBoard(id: string, title: string): Promise<BoardSummary> {
  const res = await fetch("/api/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  });
  if (!res.ok) throw new Error("Failed to create board");
  return res.json();
}

/** Creates a new board for a folder button, picking a fresh id if the slug is taken. */
export async function createFolderBoard(title: string): Promise<BoardSummary> {
  const base = slugify(title) || "board";
  let id = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await createBoard(id, title);
    } catch {
      id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }
  throw new Error("Failed to create board");
}

export async function renameBoard(id: string, title: string): Promise<BoardSummary> {
  const res = await fetch(`/api/boards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename board");
  return res.json();
}

export async function deleteBoard(id: string): Promise<void> {
  const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete board");
}

export interface ButtonInput {
  label: string;
  speak: string | null;
  category: WordCategory;
  target: string | null;
  iconId: number | null;
  iconUpload: string | null;
}

export async function searchIcons(query: string): Promise<IconSearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/icons/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error("Icon search failed");
  return res.json();
}

export async function uploadPhoto(file: File): Promise<{ filename: string }> {
  const formData = new FormData();
  formData.append("photo", file);
  const res = await fetch("/api/uploads", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to upload photo");
  return res.json();
}

export async function createButton(boardId: string, data: ButtonInput): Promise<AacButton> {
  const res = await fetch(`/api/boards/${boardId}/buttons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create button");
  return res.json();
}

export async function updateButton(id: string, data: ButtonInput): Promise<AacButton> {
  const res = await fetch(`/api/buttons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update button");
  return res.json();
}

export async function deleteButton(id: string): Promise<void> {
  const res = await fetch(`/api/buttons/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete button");
}

export async function reorderBoard(boardId: string, order: string[]): Promise<void> {
  const res = await fetch(`/api/boards/${boardId}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error("Failed to reorder board");
}

export async function moveButton(id: string, boardId: string): Promise<AacButton> {
  const res = await fetch(`/api/buttons/${id}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boardId }),
  });
  if (!res.ok) throw new Error("Failed to move button");
  return res.json();
}
