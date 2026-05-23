import { readdir } from "fs/promises";
import path from "path";

export async function getPhotos(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "photos");
  try {
    const names = await readdir(dir);
    return names
      .filter((n) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(n))
      .map((n) => `./photos/${n}`);
  } catch {
    return [];
  }
}
