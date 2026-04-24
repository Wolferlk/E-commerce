const { spawn } = require("child_process");
const path = require("path");

const rootDir = __dirname;
const backendDir = path.join(rootDir, "E commerce");
const frontendDir = path.join(rootDir, "Frontend");

const children = [];

function runProcess(name, command, args, cwd) {
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", `${command} ${args.join(" ")}`], {
          cwd,
          stdio: ["inherit", "pipe", "pipe"]
        })
      : spawn(command, args, {
          cwd,
          stdio: ["inherit", "pipe", "pipe"]
        });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on("exit", (code) => {
    process.stdout.write(`[${name}] exited with code ${code}\n`);
    if (code !== 0) {
      shutdown(code);
    }
  });

  children.push(child);
  return child;
}

function shutdown(exitCode) {
  while (children.length) {
    const child = children.pop();
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting backend and frontend from project root...");

runProcess("backend", "npm", ["run", "start:all"], backendDir);
runProcess("frontend", "npm", ["start"], frontendDir);
