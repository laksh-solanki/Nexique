import { spawn } from "node:child_process";

const vercelArgs = [
  "--yes",
  "vercel@54.9.1",
  "dev",
  "--listen",
  "3000",
  "--scope",
  "laksh-solanki-coders-projects",
];

const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
const args =
  process.platform === "win32" ? ["/d", "/s", "/c", `npx ${vercelArgs.join(" ")}`] : vercelArgs;

const child = spawn(command, args, {
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
