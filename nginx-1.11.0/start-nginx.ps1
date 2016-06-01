#
# start_nginx.ps1
#

$rootDir = Split-Path -parent $MyInvocation.MyCommand.Definition;

if($rootDir.EndsWith("\") -eq $false)
{
   $rootDir = $rootDir + "\";
}

cd $rootDir;

#Start Nginx:
Start-Process -FilePath  (Get-Item –Path "..\nginx-1.11.0\Nginx.exe").FullName; #-Wait -NoNewWindow;
