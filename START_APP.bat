@echo off
chcp 65001 > nul
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║     🏨 HOTEL BOOKING - HOMECHAN - START APPLICATION      ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo ⏳ Đang khởi động server và client...
echo.

REM Mở Terminal 1: Server
start cmd /k "cd /d D:\Project\hotel_booking\server && echo ========== SERVER ========== && npm run server"

REM Chờ 3 giây
timeout /t 3 /nobreak

REM Mở Terminal 2: Client
start cmd /k "cd /d D:\Project\hotel_booking\client && echo ========== CLIENT ========== && npm run dev"

REM Chờ 5 giây
timeout /t 5 /nobreak

REM Mở Browser
start "" http://localhost:5173/room/6908a376b5678433775588fe

echo.
echo ✅ ✅ ✅ ĐANG CHẠY ✅ ✅ ✅
echo.
echo 📍 Server: http://localhost:3000
echo 📍 Client: http://localhost:5173
echo 📍 Room Test: http://localhost:5173/room/6908a376b5678433775588fe
echo.
echo 💡 Các terminal sẽ tự động đóng khi bạn dừng app (Ctrl+C)
echo.
pause
