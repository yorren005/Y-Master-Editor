Add-Type -AssemblyName System.Drawing

$size = 256
$srcImgPath = "$PSScriptRoot\..\src\assets\y-logo.jpg"
$srcImg = [System.Drawing.Image]::FromFile($srcImgPath)

$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.Clear([System.Drawing.Color]::Transparent)

# Rounded squircle clip
$radius = 48
$rect = New-Object System.Drawing.Rectangle(4, 4, ($size - 8), ($size - 8))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = $radius * 2
$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
$path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
$path.CloseFigure()

$g.SetClip($path)
$g.DrawImage($srcImg, $rect)
$g.ResetClip()

# Subtle warm border #d8cebe
$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 216, 206, 190), 3)
$g.DrawPath($penBorder, $path)

$pngPath = "$PSScriptRoot\..\assets\icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Generated PNG at: $pngPath"

$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = "$PSScriptRoot\..\assets\icon.ico"

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICONDIR (6 bytes)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]1)

# ICONDIRENTRY (16 bytes)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$pngBytes.Length)
$bw.Write([uint32]22)

$bw.Write($pngBytes)
$bw.Flush()

[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Close()
$ms.Close()
$srcImg.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Host "Generated ICO at: $icoPath"
