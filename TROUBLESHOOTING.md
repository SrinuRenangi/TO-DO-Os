# Troubleshooting & Diagnostics Guide — Personal Organizer v1.0.0

This guide addresses common operational questions, system configuration issues, and diagnostic procedures for **Personal Organizer**.

---

## 🔍 Diagnostic Checklist

If you encounter unexpected behavior, run through this quick triage:

1. **Is another instance running?** Check Windows Task Manager (`Ctrl + Shift + Esc`) for existing `Personal Organizer.exe` processes.
2. **Is the app in your system tray?** Check the hidden tray icons menu (the `^` arrow near the system clock).
3. **Are Windows notifications enabled?** Verify Windows Settings > System > Notifications.
4. **Is your database intact?** Check `%APPDATA%\personal-organizer\personal_organizer.db`.

---

## 🛠️ Common Issues & Resolutions

### 1. Windows Action Center Notifications Not Appearing

#### Symptoms:
Reminders reach their scheduled time and the in-app notification count increments, but no Windows banner appears on the desktop.

#### Causes & Fixes:
1. **Windows Focus Assist / Do Not Disturb is Active**:
   - In Windows 10/11, check the Action Center (bottom-right notification icon).
   - If **"Do Not Disturb"** or **"Focus Assist"** (Priority Only / Alarms Only) is ON, notifications are suppressed silently into the Action Center tray.
   - *Fix*: Turn off Focus Assist or add **Personal Organizer** to your Priority list under **Windows Settings > System > Focus Assist**.
2. **Notifications Disabled for App in Windows**:
   - Navigate to **Windows Settings > System > Notifications**.
   - Scroll down to "Notifications from apps and other senders".
   - Locate **Personal Organizer** (or `Personal.Organizer.DesktopApp`) and ensure the toggle is set to **ON**.
   - Ensure "Show notification banners" and "Play a sound" are enabled.

---

### 2. Audio Chimes Not Playing

#### Symptoms:
Toasts appear, but no audible chime sounds.

#### Causes & Fixes:
1. **Web Audio Autoplay Policy**:
   - Modern Chromium engines suspend Web Audio `AudioContext` until the user interacts with the window (a click or keypress).
   - *Fix*: Clicking anywhere in the Personal Organizer window resumes the audio context permanently.
2. **Mute Toggled in System Tray**:
   - Right-click the Personal Organizer icon in your Windows system tray.
   - Check if **"Mute Notifications"** is enabled. If checked, click it to unmute.
3. **Windows Volume Mixer**:
   - Right-click the speaker icon in your Windows taskbar and choose **Volume Mixer**.
   - Verify that **Personal Organizer** volume slider is not muted or set to zero.

---

### 3. Background Reminders Delayed After PC Sleep

#### Symptoms:
Alarms scheduled while the computer was sleeping or hibernating do not fire immediately when waking up.

#### Causes & Fixes:
1. **Sleep / Wake Reconciliation**:
   - Personal Organizer's background scheduler daemon incorporates sleep/wake detection. It samples time every 10 seconds. When your PC wakes up, it detects the gap and fires missed reminders within 10 seconds of wake.
2. **Windows Battery Saver Throttling**:
   - Windows 11 may aggressively throttle background apps when on battery power.
   - *Fix*: Open **Windows Settings > Apps > Installed apps > Personal Organizer > Advanced options**. Under "Background apps permissions", set "Let this app run in the background" to **"Always"**.

---

### 4. Database Busy or Lock Error (`SQLITE_BUSY`)

#### Symptoms:
An error banner displays `SQLITE_BUSY: database is locked`.

#### Causes & Fixes:
1. **A Hanging Process Has the SQLite File Open**:
   - If an earlier session did not exit cleanly or was terminated by a process manager, the WAL lock may still be held.
   - *Fix*: Open Windows Command Prompt / PowerShell as Administrator and run:
     ```powershell
     taskkill /F /IM "Personal Organizer.exe" /T
     taskkill /F /IM "electron.exe" /T
     ```
   - Restart the application. SQLite will automatically clean the lock and recover WAL logs.

---

### 5. Auto-Start on Windows Startup Not Working

#### Symptoms:
Personal Organizer does not launch automatically when the computer boots up.

#### Causes & Fixes:
1. **Startup Disabled in Windows Task Manager**:
   - Press `Ctrl + Shift + Esc` to open Task Manager.
   - Click the **Startup apps** tab (speedometer icon).
   - Find **Personal Organizer**. If the status is **"Disabled"**, right-click and select **"Enable"**.
2. **Settings Toggle**:
   - Within Personal Organizer, open **Settings**.
   - Toggle **"Launch on Windows Startup"** OFF, then back ON to refresh the registry entry.

---

### 6. App Closes Instead of Staying in Tray

#### Symptoms:
Clicking the window `X` (Close) exits the program completely rather than minimizing.

#### Causes & Fixes:
- The default behavior is to minimize to tray (`mainWindow.hide()`).
- If you right-click the tray icon and select **"Quit Completely"**, the application flags `isQuitting = true` and shuts down cleanly.
- If the application is closing on `X`, verify that the system tray icon exists in the Windows notification area overflow (`^`). Windows may hide new tray icons by default; drag the Personal Organizer icon out of the overflow panel and onto the taskbar.

---

## 📊 Launching in Verbose Diagnostic Mode

To run Personal Organizer with real-time console telemetry and diagnostic output:

```powershell
# Open terminal in installation directory:
& ".\Personal Organizer.exe" --enable-logging
```

This streams all SQLite IPC operations, scheduler heartbeat ticks, and native Action Center events directly to the console.
