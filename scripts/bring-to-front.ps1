Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinTop {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern void SwitchToThisWindow(IntPtr hWnd, bool fUnknown);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
}
"@

$pids = (Get-Process -Name electron -ErrorAction SilentlyContinue).Id
Write-Output "Electron PIDs: $($pids -join ', ')"

[WinTop]::EnumWindows({
  param($hWnd, $lParam)
  $procId = [uint32]0
  [WinTop]::GetWindowThreadProcessId($hWnd, [ref]$procId) | Out-Null
  
  if ($pids -contains $procId) {
    $sb = New-Object System.Text.StringBuilder 512
    [WinTop]::GetWindowText($hWnd, $sb, 512) | Out-Null
    $title = $sb.ToString()
    $visible = [WinTop]::IsWindowVisible($hWnd)
    Write-Output "Electron Window: HWND=$hWnd, PID=$procId, Visible=$visible, Title='$title'"
    
    # Force restore and bring to top
    [WinTop]::ShowWindow($hWnd, 9) | Out-Null # SW_RESTORE (9) or SW_SHOW (5)
    [WinTop]::BringWindowToTop($hWnd) | Out-Null
    [WinTop]::SetForegroundWindow($hWnd) | Out-Null
    [WinTop]::SwitchToThisWindow($hWnd, $true)
  }
  return $true
}, [IntPtr]::Zero) | Out-Null
