import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sourceDir = resolve(process.cwd(), "src/generated/client");
const targetDir = resolve(process.cwd(), "dist/src/generated/client");

if (!existsSync(sourceDir)) {
  console.error("Prisma client source not found. Run prisma generate first.");
  process.exit(1);
}

mkdirSync(resolve(process.cwd(), "dist/src/generated"), { recursive: true });
rmSync(targetDir, { recursive: true, force: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log("Synced generated Prisma client into dist.");
