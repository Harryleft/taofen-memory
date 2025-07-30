@echo off
echo 启动邹韬奋纪念网页前端开发服务器...
echo.
cd /d "%~dp0"
node node_modules\vite\bin\vite.js
pause