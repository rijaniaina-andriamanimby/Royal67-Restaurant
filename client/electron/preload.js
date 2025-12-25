// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printPdf: (buffer) => ipcRenderer.invoke("print-pdf", buffer)
});
