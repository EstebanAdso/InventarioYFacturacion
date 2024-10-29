const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('html/index.html'); // Cambia a la ruta de tu archivo HTML de inicio
}

// Función para ejecutar el archivo JAR
function runJar() {
  const jarPath = path.join(__dirname, 'BackendInventario-0.0.1-SNAPSHOT.jar'); // Ruta del JAR en la misma carpeta

  exec(`java -jar "${jarPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el JAR: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error de salida: ${stderr}`);
      return;
    }
    console.log(`Salida del JAR: ${stdout}`);
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
