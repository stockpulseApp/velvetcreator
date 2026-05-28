import { readFileSync, existsSync } from "fs";
import { join } from "path";

export type FetishCategory = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

type Catalog = { categories: FetishCategory[] };

function loadCatalog(): Catalog {
  const candidates = [
    join(process.cwd(), "config", "fetishes.json"),
    join(process.cwd(), "../../config/fetishes.json"),
    join(process.cwd(), "../../../config/fetishes.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, "utf8")) as Catalog;
    }
  }
  return { categories: [] };
}

export const FETISH_CATALOG = loadCatalog();

export function allFetishTags(): string[] {
  const set = new Set<string>();
  for (const cat of FETISH_CATALOG.categories) {
    for (const tag of cat.tags) set.add(tag);
  }
  return [...set].sort();
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}
