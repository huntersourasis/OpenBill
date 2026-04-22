import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = app.isPackaged;

const basePath = isProd ? process.resourcesPath : path.join(__dirname, "..");

const serverPath = isProd
  ? path.join(process.resourcesPath, "app.asar.unpacked", "server.js")
  : path.join(basePath, "server.js");

const envPath = path.join(basePath, ".env");

let serverProcess;

function startServer() {
  serverProcess = spawn("node", [serverPath], {
    cwd: basePath,
    env: { ...process.env, ENV_PATH: envPath },
    stdio: "pipe",
  });

  serverProcess.stdout.on("data", (data) => {
    console.log("[SERVER OUT]:", data.toString());
  });

  serverProcess.stderr.on("data", (data) => {
    console.error("[SERVER ERR]:", data.toString());
  });

  serverProcess.on("exit", (code) => {
    console.error("Server exited with code:", code);
  });
}

function waitForServer(url, retries = 40) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, () => resolve())
        .on("error", () => {
          if (retries-- === 0) reject(new Error("Server not starting"));
          else setTimeout(attempt, 500);
        });
    };
    attempt();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.maximize();
  win.loadURL("http://localhost:2026");

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.whenReady().then(async () => {
  startServer();

  try {
    await waitForServer("http://localhost:2026");
    createWindow();
  } catch (err) {
    console.error("Server failed:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});
