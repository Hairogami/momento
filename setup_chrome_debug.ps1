$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeArgs = "--remote-debugging-port=9222 --user-data-dir=`"C:\Users\moume\AppData\Local\Google\Chrome\User Data`" --profile-directory=Default"
$WshShell = New-Object -comObject WScript.Shell

# 1. Raccourci bureau
$desk = $WshShell.CreateShortcut("C:\Users\moume\Desktop\Google Chrome.lnk")
$desk.TargetPath = $chromePath
$desk.Arguments = $chromeArgs
$desk.IconLocation = "$chromePath,0"
$desk.Save()
Write-Output "Bureau OK"

# 2. Raccourci Start Menu personnel
$startDir = "C:\Users\moume\AppData\Roaming\Microsoft\Windows\Start Menu\Programs"
$start = $WshShell.CreateShortcut("$startDir\Google Chrome.lnk")
$start.TargetPath = $chromePath
$start.Arguments = $chromeArgs
$start.IconLocation = "$chromePath,0"
$start.Save()
Write-Output "Start Menu OK"

# 3. Démarrage automatique au login
$startupVal = "`"$chromePath`" $chromeArgs"
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "ChromeDebug" -Value $startupVal
Write-Output "Startup OK"
