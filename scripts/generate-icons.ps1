Add-Type -AssemblyName System.Drawing

function New-CaigeIcon {
  param([int]$Size, [string]$OutputPath, [bool]$Maskable = $false)
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $navy = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
  $orange = [System.Drawing.Color]::FromArgb(255, 234, 78, 24)
  $cream = [System.Drawing.Color]::FromArgb(255, 250, 248, 241)
  $graphics.Clear($(if ($Maskable) { $orange } else { $cream }))
  $padding = $(if ($Maskable) { [int]($Size * 0.18) } else { [int]($Size * 0.08) })
  $square = [System.Drawing.Rectangle]::new($padding, $padding, ($Size - 2 * $padding), ($Size - 2 * $padding))
  $navyBrush = [System.Drawing.SolidBrush]::new($navy)
  $orangeBrush = [System.Drawing.SolidBrush]::new($orange)
  $creamBrush = [System.Drawing.SolidBrush]::new($cream)
  $graphics.FillRectangle($navyBrush, $square)
  $railWidth = [Math]::Max(4, [int]($Size * 0.055))
  $graphics.FillRectangle($orangeBrush, $padding, $padding, $railWidth, $square.Height)
  $fontSize = [single]($Size * $(if ($Maskable) { 0.34 } else { 0.42 }))
  $font = [System.Drawing.Font]::new('Arial', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = [System.Drawing.RectangleF]::new(($padding + $railWidth), $padding, ($square.Width - $railWidth), $square.Height)
  $graphics.DrawString('C', $font, $creamBrush, $textRect, $format)
  $dotSize = [Math]::Max(3, [int]($Size * 0.045))
  $dotX = [int]($padding + $square.Width * 0.71)
  $dotY = [int]($padding + $square.Height * 0.66)
  $graphics.FillEllipse($orangeBrush, $dotX, $dotY, $dotSize, $dotSize)
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $creamBrush.Dispose(); $orangeBrush.Dispose(); $navyBrush.Dispose(); $format.Dispose(); $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

$publicDir = Join-Path $PSScriptRoot '..\public'
New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
New-CaigeIcon -Size 64 -OutputPath (Join-Path $publicDir 'favicon.png')
New-CaigeIcon -Size 180 -OutputPath (Join-Path $publicDir 'apple-touch-icon.png')
New-CaigeIcon -Size 192 -OutputPath (Join-Path $publicDir 'pwa-192.png')
New-CaigeIcon -Size 512 -OutputPath (Join-Path $publicDir 'pwa-512.png')
New-CaigeIcon -Size 512 -OutputPath (Join-Path $publicDir 'pwa-maskable.png') -Maskable $true
