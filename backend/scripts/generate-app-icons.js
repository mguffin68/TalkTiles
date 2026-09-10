import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "..", "app", "public");

// Speech bubble centered well within the maskable "safe zone" (inner ~80% circle).
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#5b9bd5"/>
  <g fill="#ffffff">
    <path d="M256,120 C351,120 400,168 400,236 C400,304 351,352 256,352
             C231,352 208,349 188,342 L128,372 L148,318
             C120,297 112,268 112,236 C112,168 161,120 256,120 Z"/>
    <circle cx="196" cy="236" r="18" fill="#5b9bd5"/>
    <circle cx="256" cy="236" r="18" fill="#5b9bd5"/>
    <circle cx="316" cy="236" r="18" fill="#5b9bd5"/>
  </g>
</svg>`;

async function main() {
  const svgBuffer = Buffer.from(svg);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, "maskable-icon-512.png"));
  await sharp(svgBuffer)
    .resize(180, 180)
    .flatten({ background: "#5b9bd5" })
    .png()
    .toFile(path.join(outDir, "apple-touch-icon.png"));

  console.log(
    "Wrote icon-192.png, icon-512.png, maskable-icon-512.png, apple-touch-icon.png to",
    outDir
  );
}

main();
