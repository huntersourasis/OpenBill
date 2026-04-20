import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverProcess = spawn("node", ["--env-file=.env", "server.js"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

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

app.whenReady().then(() => {
  setTimeout(createWindow, 2000);
});

app.on("window-all-closed", () => {
  serverProcess.kill();
  app.quit();
});
