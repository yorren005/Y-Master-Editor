Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Clear transparent
$g.Clear([System.Drawing.Color]::Transparent)

# Outer squircle / rounded rect path
$radius = 48
$rect = New-Object System.Drawing.Rectangle(8, 8, ($size - 16), ($size - 16))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = $radius * 2
$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
$path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
$path.CloseFigure()

# Background Gradient: Dark Moss #242c26 to #151a16
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($size, $size)),
    [System.Drawing.Color]::FromArgb(255, 36, 44, 38),
    [System.Drawing.Color]::FromArgb(255, 21, 26, 22)
)
$g.FillPath($brushBg, $path)

# Border: Travertine Sand #b6a48c (alpha 120)
$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 182, 164, 140), 2.5)
$g.DrawPath($penBorder, $path)

# Document Sheet Inside
# Dimensions: X=60, Y=44, W=136, H=168, corner fold: 36
$docX = 56
$docY = 40
$docW = 144
$docH = 176
$fold = 38

$docPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$docPath.AddLine($docX + 8, $docY, $docX + $docW - $fold, $docY)
$docPath.AddLine($docX + $docW, $docY + $fold, $docX + $docW, $docY + $docH - 8)
$docPath.AddArc($docX + $docW - 16, $docY + $docH - 16, 16, 16, 0, 90)
$docPath.AddLine($docX + $docW - 8, $docY + $docH, $docX + 8, $docY + $docH)
$docPath.AddArc($docX, $docY + $docH - 16, 16, 16, 90, 90)
$docPath.AddLine($docX, $docY + $docH - 8, $docX, $docY + 8)
$docPath.AddArc($docX, $docY, 16, 16, 180, 90)
$docPath.CloseFigure()

# Document Body Fill: Moss Cream #f4f0e8 (warm paper)
$brushPaper = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 246, 242, 235))
$g.FillPath($brushPaper, $docPath)

# Folded Corner Path:
$foldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$foldPath.AddLine($docX + $docW - $fold, $docY, $docX + $docW - $fold, $docY + $fold)
$foldPath.AddLine($docX + $docW, $docY + $fold, $docX + $docW - $fold, $docY)
$foldPath.CloseFigure()

# Autumn Rust fold #8e511b
$brushFold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 142, 81, 27))
$g.FillPath($brushFold, $foldPath)

# Subtle fold shadow
$penFold = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 0, 0, 0), 1.5)
$g.DrawLine($penFold, ($docX + $docW - $fold), $docY, ($docX + $docW - $fold), ($docY + $fold))
$g.DrawLine($penFold, ($docX + $docW - $fold), ($docY + $fold), ($docX + $docW), ($docY + $fold))

# Document Header Bar: Prairie Grass #423b28
$brushBar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 66, 59, 40))
$g.FillRectangle($brushBar, ($docX + 20), ($docY + 32), 60, 6)

# Horizontal lines representing design/layout on page
$brushLine1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 182, 164, 140))
$g.FillRectangle($brushLine1, ($docX + 20), ($docY + 50), 104, 3)
$g.FillRectangle($brushLine1, ($docX + 20), ($docY + 62), 104, 3)
$g.FillRectangle($brushLine1, ($docX + 20), ($docY + 74), 72, 3)

# Big bold serif letter "P" in center of page
$fontSerif = New-Object System.Drawing.Font("Georgia", 44, [System.Drawing.FontStyle]::Bold)
$brushP = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 43, 53, 45))
$g.DrawString("P", $fontSerif, $brushP, ($docX + 44), ($docY + 84))

# Autumn rust accent dot in bottom-right corner of sheet
$brushAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 142, 81, 27))
$g.FillEllipse($brushAccent, ($docX + $docW - 28), ($docY + $docH - 28), 12, 12)

# Save PNG
$pngPath = "$PSScriptRoot\..\assets\icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Generated PNG at: $pngPath"

# Pack into standard 256x256 ICO file
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = "$PSScriptRoot\..\assets\icon.ico"

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICONDIR (6 bytes)
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type 1 = ICO
$bw.Write([uint16]1) # Count = 1

# ICONDIRENTRY (16 bytes)
$bw.Write([byte]0)    # Width 256 (0 means 256)
$bw.Write([byte]0)    # Height 256 (0 means 256)
$bw.Write([byte]0)    # Color count (0 for 256+ colors)
$bw.Write([byte]0)    # Reserved
$bw.Write([uint16]1)  # Color planes
$bw.Write([uint16]32) # Bits per pixel
$bw.Write([uint32]$pngBytes.Length) # Image byte size
$bw.Write([uint32]22) # Offset (6 + 16 = 22)

# Image Data (PNG bytes)
$bw.Write($pngBytes)
$bw.Flush()

[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Close()
$ms.Close()
$g.Dispose()
$bmp.Dispose()

Write-Host "Generated ICO at: $icoPath"
