$action = New-ScheduledTaskAction -Execute "C:\Users\yoges\launch_editor.bat"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "OpenYMasterStudio" -Action $action -Settings $settings -Force
Start-ScheduledTask -TaskName "OpenYMasterStudio"
Write-Output "Successfully scheduled and launched OpenYMasterStudio!"
