// ============================================================================
// Personal OS — SQLite Database Purge & Fresh Initialization Tool
// Removes all existing data records and establishes pristine 0-record baseline
// ============================================================================

const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const projectRoot = path.join(__dirname, '..');
const appData = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');

const locationsToCheck = [
  projectRoot,
  path.join(projectRoot, 'data'),
  path.join(appData, 'Electron'),
  path.join(appData, 'Personal Organizer'),
  path.join(appData, 'personal-organizer'),
  path.join(appData, 'TO-DO'),
];

console.log('[PurgeDB] Searching and deleting all existing SQLite database files...');

for (const dir of locationsToCheck) {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith('personal_organizer.db')) {
          const fullPath = path.join(dir, file);
          console.log('[PurgeDB] Removing:', fullPath);
          try {
            fs.unlinkSync(fullPath);
          } catch (e) {
            console.error('[PurgeDB] Could not delete:', fullPath, e.message);
          }
        }
      }
    } catch (e) {
      console.warn('[PurgeDB] Cannot scan dir:', dir, e.message);
    }
  }
}

// Clean up empty data directory
const dataDir = path.join(projectRoot, 'data');
if (fs.existsSync(dataDir)) {
  try {
    const contents = fs.readdirSync(dataDir);
    if (contents.length === 0) {
      fs.rmdirSync(dataDir);
      console.log('[PurgeDB] Removed empty data directory.');
    }
  } catch (e) {}
}

console.log('[PurgeDB] All existing database files cleanly removed.');

// Initialize fresh database via DatabaseManager
const { DatabaseManager } = require(path.join(projectRoot, 'src', 'app', 'database', 'database-manager.cjs'));
const mgr = new DatabaseManager();
const db = mgr.initialize(projectRoot);

console.log('[PurgeDB] Fresh database initialized at:', mgr.getDbPath());

const tables = ['tasks', 'subtasks', 'reminders', 'notes', 'events', 'notifications', 'timer', 'settings'];
console.log('\n========================================');
console.log('   PRISTINE DATABASE VERIFICATION       ');
console.log('========================================');
for (const tbl of tables) {
  try {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${tbl}`).get();
    console.log(`  Table [${tbl.padEnd(14)}]: ${row.count} rows`);
  } catch (err) {
    console.error(`  Table [${tbl.padEnd(14)}]: ERROR: ${err.message}`);
  }
}
console.log('========================================\n');

try {
  db.pragma('wal_checkpoint(TRUNCATE)');
  db.close();
  console.log('[PurgeDB] Database closed and WAL checkpointed.');
} catch (e) {
  console.warn('[PurgeDB] Close note:', e.message);
}

if (app) {
  app.quit();
}
