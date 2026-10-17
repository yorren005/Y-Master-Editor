Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class WinUtils {
    public delegate bool CallBack(IntPtr hWnd, int lParam);
    [DllImport("user32.dll")]
    public static extern int EnumWindows(CallBack x, int y);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
  }
"@

$electronPids = (Get-Process electron -ErrorAction SilentlyContinue).Id

[WinUtils]::EnumWindows({
  param($hWnd, $lParam)
  $procId = [uint32]0
  [WinUtils]::GetWindowThreadProcessId($hWnd, [ref]$procId)
  $sb = New-Object System.Text.StringBuilder 512
  [WinUtils]::GetWindowText($hWnd, $sb, 512) | Out-Null
  $wTitle = $sb.ToString()

  if ($electronPids -contains $procId -or $wTitle -match "Y Master Editor") {
    $visible = [WinUtils]::IsWindowVisible($hWnd)
    Write-Output "FOUND: HWND=$hWnd PID=$procId Visible=$visible Title='$wTitle'"
    [WinUtils]::ShowWindow($hWnd, 9) | Out-Null # SW_RESTORE
    [WinUtils]::SetForegroundWindow($hWnd) | Out-Null
  }
  return $true
}, 0) | Out-Null
