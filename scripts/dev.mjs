import { spawn } from "node:child_process";

// If --vercel flag is present, run Vercel CLI. Otherwise run Vite directly on port 3000.
const useVercel = process.argv.includes("--vercel");

let runCommand;
let runArgs;

if (useVercel) {
  const vercelArgs = [
    "--yes",
    "vercel@54.9.1",
    "dev",
    "--listen",
    "3000",
    "--scope",
    "laksh-solanki-coders-projects",
  ];
  runCommand = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
  runArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", `npx ${vercelArgs.join(" ")}`] : vercelArgs;
} else {
  // Directly run Vite on port 3000 for zero-auth local setup
  const viteArgs = ["vite", "--port", "3000", "--host"];
  runCommand = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
  runArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", `npx ${viteArgs.join(" ")}`] : viteArgs;
}

const child = spawn(runCommand, runArgs, {
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
