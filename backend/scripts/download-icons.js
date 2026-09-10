import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const iconsDir = path.join(dataDir, "icons");
const rawMetaPath = path.join(dataDir, "icons-meta-raw.json");
const indexPath = path.join(dataDir, "icons-index.json");
const failedPath = path.join(dataDir, "icons-failed.json");

const CONCURRENCY = 16;
const MAX_RETRIES = 3;

async function fetchMetadata() {
  if (existsSync(rawMetaPath)) {
    console.log("Using cached metadata at", rawMetaPath);
    return JSON.parse(await readFile(rawMetaPath, "utf-8"));
  }
  console.log("Fetching pictogram metadata from ARASAAC...");
  const res = await fetch("https://api.arasaac.org/api/pictograms/all/en");
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.status}`);
  const data = await res.json();
  await writeFile(rawMetaPath, JSON.stringify(data));
  console.log(`Fetched metadata for ${data.length} pictograms`);
  return data;
}

function buildIndex(raw) {
  return raw.map((p) => ({
    id: p._id,
    keywords: (p.keywords ?? []).map((k) => k.keyword).filter(Boolean),
    categories: p.categories ?? [],
  }));
}

async function downloadOne(id) {
  const dest = path.join(iconsDir, `${id}.png`);
  if (existsSync(dest)) return "skipped";

  const url = `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buffer);
      return "downloaded";
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return { error: err.message };
      }
    }
  }
}

async function runPool(items, worker, concurrency) {
  let index = 0;
  let done = 0;
  const results = new Array(items.length);

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
      done++;
      if (done % 500 === 0 || done === items.length) {
        console.log(`Progress: ${done}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  const raw = await fetchMetadata();
  const index = buildIndex(raw);
  await writeFile(indexPath, JSON.stringify(index));
  console.log(`Wrote search index with ${index.length} entries to ${indexPath}`);

  const ids = raw.map((p) => p._id);
  console.log(`Downloading ${ids.length} icons with concurrency ${CONCURRENCY}...`);

  const results = await runPool(ids, downloadOne, CONCURRENCY);

  const failed = [];
  let downloaded = 0;
  let skipped = 0;
  results.forEach((r, i) => {
    if (r === "downloaded") downloaded++;
    else if (r === "skipped") skipped++;
    else if (r && r.error) failed.push({ id: ids[i], error: r.error });
  });

  await writeFile(failedPath, JSON.stringify(failed, null, 2));
  console.log(
    `Done. downloaded=${downloaded} skipped=${skipped} failed=${failed.length}`
  );
  if (failed.length > 0) {
    console.log(`Failed ids written to ${failedPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
