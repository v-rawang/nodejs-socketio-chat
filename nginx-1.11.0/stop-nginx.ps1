#
# stop_nginx.ps1
#

#List the processes relating to Nginx:
Get-Process -Name Ng*;

#Stop all of the processes relating to Nginx (if any):
Stop-Process -Name Nginx;