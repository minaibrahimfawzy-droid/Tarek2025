const { app, BrowserWindow, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = !app.isPackaged;

function setupAutoUpdate(win) {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', () => {
    win.webContents.send('update-status', 'available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-status', 'downloaded');
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'تحديث جديد',
      message: 'تم تحميل تحديث جديد للبرنامج. سيتم تثبيته عند إغلاق البرنامج.',
      buttons: ['حسنًا']
    });
  });

  autoUpdater.on('error', () => {
    // If the PC is offline or the update service is unavailable, keep the app running normally.
  });

  autoUpdater.checkForUpdates().catch(() => {});
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (!isDev) win.webContents.on('devtools-opened', () => win.webContents.closeDevTools());
  setupAutoUpdate(win);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
