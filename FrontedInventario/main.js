import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
  });

  win.loadFile('html/facturacion.html'); // Cambia a la ruta de tu archivo HTML de inicio
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
