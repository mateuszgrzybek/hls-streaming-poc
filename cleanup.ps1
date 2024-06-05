# Get the directory of the script
$directory = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Remove .mp3 files in the audio subdirectory with 'converted' in filename
Get-ChildItem -Path "$directory\audio" -Filter *converted*.mp3 -Recurse | Remove-Item -Force

# Enter the hls subdirectory and remove all files except README.md
Set-Location "$directory\audio\hls"
Get-ChildItem | Where-Object { $_.Name -ne "README.md" } | Remove-Item -Force

# Return to the script directory
Set-Location $directory