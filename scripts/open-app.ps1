$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'Y Master Editor.lnk'

$ws = New-Object -ComObject WScript.Shell
$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'Y:\github repositories\Y-Master-Editor\node_modules\electron\dist\electron.exe'
$shortcut.Arguments = '"Y:\github repositories\Y-Master-Editor"'
$shortcut.WorkingDirectory = 'Y:\github repositories\Y-Master-Editor'
$shortcut.IconLocation = 'Y:\github repositories\Y-Master-Editor\src\assets\y-logo.jpg, 0'
$shortcut.Description = 'Y Master Editor — Precision Vector & Editorial Studio'
$shortcut.Save()

Write-Output "Created shortcut: $shortcutPath"

# Launch using Windows ShellExecute
Invoke-Item $shortcutPath
Write-Output "Launched Y Master Editor via Windows Shell!"
