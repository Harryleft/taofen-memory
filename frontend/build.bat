@echo off
echo 构建邹韬奋纪念网页前端生产版本...
echo.
cd /d "%~dp0"
npx tsc && node node_modules\vite\bin\vite.js build
echo.
echo 构建完成！文件位于 dist 目录中。
pause