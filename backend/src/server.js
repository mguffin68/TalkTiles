import express from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { HOME_BOARD_ID } from "./seedData.js";

db.exec("PRAGMA foreign_keys = ON;");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const uploadsDir = path.join(dataDir, "uploads");
await mkdir(uploadsDir, { recursive: true });

const iconsIndex = JSON.parse(readFileSync(path.join(dataDir, "icons-index.json"), "utf-8"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

const app = express();
app.use(express.json());
app.use("/icons", express.static(path.join(dataDir, "icons")));
app.use("/uploads", express.static(uploadsDir));

app.post("/api/uploads", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "photo file is required (image/*)" });
  }

  const filename = `${randomUUID()}.jpg`;
  try {
    const buffer = await sharp(req.file.buffer)
      .rotate() // respect EXIF orientation
      .resize(400, 400, { fit: "cover", position: "attention" })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(path.join(uploadsDir, filename), buffer);
  } catch {
    return res.status(400).json({ error: "Could not process image" });
  }

  res.status(201).json({ filename });
});

app.get("/api/icons/search", (req, res) => {
  const q = (req.query.q ?? "").toString().trim().toLowerCase();
  if (!q) return res.json([]);

  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const results = [];
  for (const icon of iconsIndex) {
    const match = icon.keywords.find((k) => k.toLowerCase().includes(q));
    if (match) {
      results.push({ id: icon.id, keyword: match });
      if (results.length >= limit) break;
    }
  }
  res.json(results);
});

function boardRow(row) {
  return { id: row.id, title: row.title };
}

function buttonRow(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    label: row.label,
    speak: row.speak ?? undefined,
    category: row.category,
    target: row.target ?? undefined,
    iconId: row.icon_id ?? undefined,
    iconUpload: row.icon_upload ?? undefined,
  };
}

app.get("/api/boards", (req, res) => {
  const rows = db.prepare("SELECT * FROM boards ORDER BY title").all();
  res.json(rows.map(boardRow));
});

app.get("/api/boards/:id", (req, res) => {
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const buttons = db
    .prepare("SELECT * FROM buttons WHERE board_id = ? ORDER BY position")
    .all(req.params.id);

  res.json({ ...boardRow(board), buttons: buttons.map(buttonRow) });
});

app.post("/api/boards", (req, res) => {
  const { id, title } = req.body;
  if (!id || !title) return res.status(400).json({ error: "id and title are required" });

  try {
    db.prepare("INSERT INTO boards (id, title) VALUES (?, ?)").run(id, title);
  } catch (err) {
    return res.status(409).json({ error: "Board id already exists" });
  }
  res.status(201).json({ id, title });
});

app.put("/api/boards/:id", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });

  const result = db.prepare("UPDATE boards SET title = ? WHERE id = ?").run(title, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Board not found" });
  res.json({ id: req.params.id, title });
});

app.delete("/api/boards/:id", (req, res) => {
  if (req.params.id === HOME_BOARD_ID) {
    return res.status(403).json({ error: "Cannot delete the home board" });
  }

  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM buttons WHERE target = ?")
    .get(req.params.id);
  if (count > 0) {
    return res.status(409).json({ error: "Board is still linked from a folder button" });
  }

  const result = db.prepare("DELETE FROM boards WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Board not found" });
  res.status(204).end();
});

app.post("/api/boards/:boardId/buttons", (req, res) => {
  const board = db.prepare("SELECT id FROM boards WHERE id = ?").get(req.params.boardId);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const { label, speak, category, target, iconId, iconUpload } = req.body;
  if (!label || !category) {
    return res.status(400).json({ error: "label and category are required" });
  }

  const id = randomUUID();
  const { maxPosition } = db
    .prepare("SELECT COALESCE(MAX(position), -1) as maxPosition FROM buttons WHERE board_id = ?")
    .get(req.params.boardId);

  db.prepare(
    "INSERT INTO buttons (id, board_id, label, speak, category, target, icon_id, icon_upload, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    req.params.boardId,
    label,
    speak ?? null,
    category,
    target ?? null,
    iconId ?? null,
    iconUpload ?? null,
    maxPosition + 1
  );

  const row = db.prepare("SELECT * FROM buttons WHERE id = ?").get(id);
  res.status(201).json(buttonRow(row));
});

app.put("/api/buttons/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM buttons WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Button not found" });

  const { label, category } = req.body;
  if (!label || !category) {
    return res.status(400).json({ error: "label and category are required" });
  }
  const speak = req.body.speak ?? null;
  const target = req.body.target ?? null;
  const iconId = req.body.iconId ?? null;
  const iconUpload = req.body.iconUpload ?? null;

  db.prepare(
    "UPDATE buttons SET label = ?, speak = ?, category = ?, target = ?, icon_id = ?, icon_upload = ? WHERE id = ?"
  ).run(label, speak, category, target, iconId, iconUpload, req.params.id);

  const row = db.prepare("SELECT * FROM buttons WHERE id = ?").get(req.params.id);
  res.json(buttonRow(row));
});

app.delete("/api/buttons/:id", (req, res) => {
  const result = db.prepare("DELETE FROM buttons WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Button not found" });
  res.status(204).end();
});

app.put("/api/boards/:boardId/reorder", (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array of button ids" });

  const existing = db
    .prepare("SELECT id FROM buttons WHERE board_id = ?")
    .all(req.params.boardId)
    .map((row) => row.id);

  const sameSet =
    existing.length === order.length && existing.every((id) => order.includes(id));
  if (!sameSet) {
    return res.status(400).json({ error: "order must match the board's current buttons exactly" });
  }

  const update = db.prepare("UPDATE buttons SET position = ? WHERE id = ?");
  db.exec("BEGIN");
  try {
    order.forEach((id, position) => update.run(position, id));
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  res.status(204).end();
});

app.post("/api/buttons/:id/move", (req, res) => {
  const button = db.prepare("SELECT * FROM buttons WHERE id = ?").get(req.params.id);
  if (!button) return res.status(404).json({ error: "Button not found" });

  const { boardId } = req.body;
  if (!boardId) return res.status(400).json({ error: "boardId is required" });

  const destBoard = db.prepare("SELECT id FROM boards WHERE id = ?").get(boardId);
  if (!destBoard) return res.status(404).json({ error: "Destination board not found" });

  if (boardId === button.board_id) {
    return res.json(buttonRow(button));
  }

  const { maxPosition } = db
    .prepare("SELECT COALESCE(MAX(position), -1) as maxPosition FROM buttons WHERE board_id = ?")
    .get(boardId);

  db.prepare("UPDATE buttons SET board_id = ?, position = ? WHERE id = ?").run(
    boardId,
    maxPosition + 1,
    req.params.id
  );

  const row = db.prepare("SELECT * FROM buttons WHERE id = ?").get(req.params.id);
  res.json(buttonRow(row));
});

// The built frontend, copied in here at Docker image build time. In dev,
// the frontend runs separately via Vite, so this directory just won't exist
// — express.static and sendFile both no-op harmlessly in that case.
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// SPA fallback so a hard reload on a client-side route (e.g. /edit) doesn't
// 404 — must come after every other route above.
app.get(/^(?!\/api|\/icons|\/uploads).*/, (req, res, next) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`AAC backend listening on http://localhost:${PORT}`);
});
