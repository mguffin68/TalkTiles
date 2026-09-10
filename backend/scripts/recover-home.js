import { db } from "../src/db.js";
import { seedButtons } from "../src/seedData.js";

const existing = db.prepare("SELECT id FROM boards WHERE id = 'home'").get();
if (existing) {
  console.log("home board already exists, nothing to do");
  process.exit(0);
}

db.prepare("INSERT INTO boards (id, title) VALUES (?, ?)").run("home", "Home");

const insertButton = db.prepare(
  "INSERT INTO buttons (id, board_id, label, speak, category, target, position) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

let position = 0;
for (const button of seedButtons.filter((b) => b.boardId === "home")) {
  insertButton.run(
    button.id,
    "home",
    button.label,
    button.speak ?? null,
    button.category,
    button.target ?? null,
    position++
  );
}

// Reconnect the orphaned "New Board" board that lost its link when home was deleted.
insertButton.run(
  "recovered-new-board-link",
  "home",
  "New Board",
  null,
  "folder",
  "new-board",
  position++
);

console.log("Restored home board with", position, "buttons");
