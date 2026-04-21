import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  const fileContent = readFileSync(filePath, "utf8");

  for (const line of fileContent.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");

    if (equalIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

const commandArgs = process.argv.slice(2);

if (commandArgs.length === 0) {
  console.error("Usage: node scripts/run-with-env.mjs <command> [args...]");
  process.exit(1);
}

const envFilePath = resolve(process.cwd(), ".env");
const loadedEnv = loadDotEnv(envFilePath);

const command = commandArgs[0];
const args = commandArgs.slice(1);

const child = spawn(command, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    ...loadedEnv
  },
  shell: process.platform === "win32"
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
