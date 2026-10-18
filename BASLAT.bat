@echo off
cd /d "%~dp0"
where python >nul 2>nul && (python serve.py & goto :eof)
where py >nul 2>nul && (py serve.py & goto :eof)
where node >nul 2>nul && (start "" http://localhost:4173 & node scripts\serve.mjs 4173 & goto :eof)
echo Python bulunamadi. Komut istemine "python serve.py" yazmayi deneyin.
pause
