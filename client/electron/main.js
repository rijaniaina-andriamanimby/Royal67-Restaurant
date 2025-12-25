// electron/main.js
import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = os.tmpdir();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // Impression PDF
  ipcMain.handle("print-pdf", async (_event, uint8) => {
    const pdfBuffer = Buffer.from(uint8);
    const filePath = path.join(tempDir, `recu_${Date.now()}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    // Ouvre le PDF avec la visionneuse par défaut
    await shell.openPath(filePath);

    const printWin = new BrowserWindow({ show: false });
    await printWin.loadURL(`file://${filePath}`);

    await printWin.webContents.print({
      silent: true,
      printBackground: true
    });

    printWin.close();
    return true;
  });

  // Load app
  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
