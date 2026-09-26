@echo off
title Personal Organizer
echo Starting Personal Organizer Standalone Desktop Application...
cd /d "%~dp0"
call npx electron electron-main.cjs
exit
