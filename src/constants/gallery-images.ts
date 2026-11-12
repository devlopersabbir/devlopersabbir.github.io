import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const galleryDirectory = resolve(process.cwd(), "public", "gallary");
const imageFilePattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

export const galleryImages = readdirSync(galleryDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isFile() && imageFilePattern.test(entry.name))
  .map((entry) => `/gallary/${encodeURIComponent(entry.name)}`)
  .sort();
