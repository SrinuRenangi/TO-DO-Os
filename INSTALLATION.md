# Personal Organizer — Installation & Setup Guide

This guide details the system prerequisites, installation methods, build instructions, and post-installation verification steps for **Personal Organizer v1.0.0**.

---

## 💻 System Prerequisites

### Minimum Requirements
- **Operating System**: Microsoft Windows 10 (Build 19041+) or Windows 11 (64-bit Architecture).
- **Processor**: Intel Core i3 / AMD Ryzen 3 or higher.
- **Memory**: 4 GB RAM (8 GB recommended).
- **Storage**: 350 MB free disk space for application files and SQLite databases.
- **Display**: 1280 x 720 minimum screen resolution.

### Development & Source Build Prerequisites
- **Node.js**: `v20.x` or `v24.x` (LTS releases recommended).
- **npm**: `v10.x` or `v11.x`.
- **C++ Build Tools** (Optional, only needed if recompiling `better-sqlite3` from source): Visual Studio Build Tools with "Desktop development with C++".

---

## 📥 Installation Options

### Option 1: Standard Windows Installer (NSIS)
The recommended distribution method for end-users:
1. Locate the installer executable: `release/Personal Organizer Setup 1.0.0.exe`.
2. Double-click the installer to launch the setup wizard.
3. Choose your desired destination folder (default: `C:\Users\<User>\AppData\Local\Programs\Personal Organizer`).
4. Select whether to create Desktop and Start Menu shortcuts.
5. Click **Install**.
6. Check **"Run Personal Organizer"** and click **Finish**.
7. *Uninstallation*: The application registers with Windows Control Panel / Settings. To remove, navigate to **Settings > Apps > Installed apps**, select **Personal Organizer**, and click **Uninstall**.

### Option 2: Portable Windows Binary
For portable environments or running directly from an external drive without administrative privileges:
1. Locate `release/Personal Organizer 1.0.0.exe`.
2. Place the executable in any folder or USB drive.
3. Double-click to run immediately without installation.
4. *Data Storage*: Data is persistently stored in `%APPDATA%\Personal Organizer\personal_organizer.db`.

---

## 🛠️ Building From Source

To build and package Personal Organizer from the repository:

### Step 1: Clone Repository
```powershell
git clone https://github.com/SrinuRenangi/TO-DO-Os.git
cd TO-DO-Os
```

### Step 2: Install Node Dependencies
```powershell
npm install
```

### Step 3: Run Test Suite
Confirm all 21 unit and integration tests pass:
```powershell
npm test
```

### Step 4: Build Web Assets
Compile TypeScript, TailwindCSS v4, and React components via Vite:
```powershell
npm run build
```
The compiled static assets will be output to the `dist/` directory.

### Step 5: Package Executables with Electron Builder
Generate the NSIS installer and portable executable:
```powershell
npm run package
```
All production installers and binaries will be written to the `release/` directory.

---

## 🚀 Launching in Development Mode

If you wish to run the live application during development:

```powershell
# In terminal:
npm run desktop
```
Or double-click the included batch launcher:
```text
Launch Personal Organizer.bat
```

---

## 🔍 Post-Installation Verification

After launching the application, verify that your environment is fully operational:

1. **Database Creation**:
   Check that the SQLite database files are initialized in the application directory or `%APPDATA%\personal-organizer`:
   - `personal_organizer.db`
   - `personal_organizer.db-wal` (Write-Ahead Log)
   - `personal_organizer.db-shm` (Shared Memory Index)
2. **System Tray Integration**:
   Look at the Windows notification area (bottom-right taskbar). Confirm the blue Personal Organizer icon is present. Right-click the icon to test the context menu.
3. **Action Center Notifications**:
   Create a test task with a reminder set for 1 minute in the future. Confirm that a Windows toast banner appears and chimes upon reaching the scheduled time.
4. **Auto-Start Registration**:
   Navigate to **Settings** within Personal Organizer. Toggle **"Launch on Windows Startup"** to ON. Verify under Windows Task Manager (**Startup apps** tab) that Personal Organizer is registered.
