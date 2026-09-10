import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { seedBoards, seedButtons } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "aac.db");

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS buttons (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    speak TEXT,
    category TEXT NOT NULL,
    target TEXT,
    position INTEGER NOT NULL
  );
`);

try {
  db.exec("ALTER TABLE buttons ADD COLUMN icon_id INTEGER");
} catch {
  // column already exists
}

try {
  db.exec("ALTER TABLE buttons ADD COLUMN icon_upload TEXT");
} catch {
  // column already exists
}

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM boards").get();
  if (count > 0) return;

  const insertBoard = db.prepare("INSERT INTO boards (id, title) VALUES (?, ?)");
  const insertButton = db.prepare(
    "INSERT INTO buttons (id, board_id, label, speak, category, target, position) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  for (const board of seedBoards) {
    insertBoard.run(board.id, board.title);
  }

  const positionByBoard = new Map();
  for (const button of seedButtons) {
    const position = positionByBoard.get(button.boardId) ?? 0;
    insertButton.run(
      button.id,
      button.boardId,
      button.label,
      button.speak ?? null,
      button.category,
      button.target ?? null,
      position
    );
    positionByBoard.set(button.boardId, position + 1);
  }
}

seedIfEmpty();
