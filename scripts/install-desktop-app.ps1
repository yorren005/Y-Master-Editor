# scripts/install-desktop-app.ps1
# Installs Y Master Editor to Windows Desktop and Start Menu with Instant Live Reload

$projectDir = "Y:\github repositories\Y-Master-Editor"
$electronExe = Join-Path $projectDir "node_modules\electron\dist\electron.exe"
$iconPath = Join-Path $projectDir "assets\icon.ico"
if (-not (Test-Path $iconPath)) {
    $iconPath = Join-Path $projectDir "src\assets\y-logo.jpg"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ">>> INSTALLING Y MASTER EDITOR (INSTANT LIVE-RELOAD) <<<" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $electronExe)) {
    Write-Host "Electron binary not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

$ws = New-Object -ComObject WScript.Shell

# 1. Install Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath('Desktop')
$desktopShortcutPath = Join-Path $desktopPath "Y Master Editor.lnk"

$desktopShortcut = $ws.CreateShortcut($desktopShortcutPath)
$desktopShortcut.TargetPath = $electronExe
$desktopShortcut.Arguments = "`"$projectDir`""
$desktopShortcut.WorkingDirectory = $projectDir
$desktopShortcut.IconLocation = "$iconPath, 0"
$desktopShortcut.Description = "Y Master Editor - Precision Vector and Editorial Studio (Instant Live Reload)"
$desktopShortcut.Save()

Write-Host "Installed Desktop Shortcut: $desktopShortcutPath" -ForegroundColor Green

# 2. Install Start Menu Shortcut
$startMenuPath = Join-Path ([Environment]::GetFolderPath('ApplicationData')) "Microsoft\Windows\Start Menu\Programs"
$startMenuShortcutPath = Join-Path $startMenuPath "Y Master Editor.lnk"

$startMenuShortcut = $ws.CreateShortcut($startMenuShortcutPath)
$startMenuShortcut.TargetPath = $electronExe
$startMenuShortcut.Arguments = "`"$projectDir`""
$startMenuShortcut.WorkingDirectory = $projectDir
$startMenuShortcut.IconLocation = "$iconPath, 0"
$startMenuShortcut.Description = "Y Master Editor - Precision Vector and Editorial Studio (Instant Live Reload)"
$startMenuShortcut.Save()

Write-Host "Installed Start Menu Shortcut: $startMenuShortcutPath" -ForegroundColor Green

# 3. Launch the Application
Write-Host "`nLaunching Y Master Editor on your desktop..." -ForegroundColor Cyan
Start-Process -FilePath $electronExe -ArgumentList "`"$projectDir`"" -WorkingDirectory $projectDir

Write-Host "Y Master Editor is now live! Any code changes in src/ or electron/ will reflect almost instantly." -ForegroundColor Green
