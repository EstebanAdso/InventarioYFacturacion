const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
  });

  win.loadFile('html/index.html'); // Cambia a la ruta de tu archivo HTML de inicio
}

// Función para ejecutar el archivo JAR
function runJar() {
  const jarPath = path.join(__dirname, 'BackendInventario-0.0.1-SNAPSHOT.jar'); // Ruta del JAR en la misma carpeta

  const jarProcess = spawn('java', ['-jar', jarPath]);

  jarProcess.stdout.on('data', (data) => {
    console.log(`Salida del JAR: ${data}`);
  });

  jarProcess.stderr.on('data', (data) => {
    console.error(`Error de salida: ${data}`);
  });

  jarProcess.on('close', (code) => {
    console.log(`Proceso del JAR finalizado con código ${code}`);
  });
}

app.whenReady().then(() => {
  createWindow();
  runJar(); // Ejecuta el archivo JAR al iniciar la aplicación

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
