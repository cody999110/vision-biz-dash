# 一键启动前后端（Windows PowerShell）
# 后端与前端各自在独立窗口运行，依赖安装进度在对应窗口可见。
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "vision-biz-dash-main"

Write-Host "==> Axera Dashboard 一键启动" -ForegroundColor Cyan
Write-Host "    后端: http://127.0.0.1:8000  (文档 /docs)" -ForegroundColor DarkGray
Write-Host "    前端: http://127.0.0.1:8080" -ForegroundColor DarkGray

# 后端窗口：首次自动建虚拟环境并安装依赖，然后启动 uvicorn
$BackendCmd = @"
`$ErrorActionPreference = 'Stop'
Set-Location '$Backend'
Write-Host '==> [后端] 准备环境...' -ForegroundColor Cyan
if (-not (Test-Path '.venv\Scripts\python.exe')) {
  Write-Host '==> [后端] 创建虚拟环境并安装依赖（首次较慢）...' -ForegroundColor Yellow
  py -3 -m venv .venv
  .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}
Write-Host '==> [后端] 启动 uvicorn http://127.0.0.1:8000' -ForegroundColor Green
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"@

# 前端窗口：首次自动安装依赖，然后启动 vite dev
$FrontendCmd = @"
`$ErrorActionPreference = 'Stop'
Set-Location '$Frontend'
Write-Host '==> [前端] 准备环境...' -ForegroundColor Cyan
if (-not (Test-Path 'node_modules')) {
  Write-Host '==> [前端] 安装依赖（首次约 1-2 分钟，请耐心等待）...' -ForegroundColor Yellow
  npm install
}
Write-Host '==> [前端] 启动 Vite http://127.0.0.1:8080' -ForegroundColor Green
Write-Host '    出现 Local: http://localhost:8080/ 后即可在浏览器访问' -ForegroundColor DarkGray
npm run dev
"@

Write-Host "==> 打开后端窗口..." -ForegroundColor Green
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $BackendCmd)

Write-Host "==> 打开前端窗口..." -ForegroundColor Green
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $FrontendCmd)

Write-Host ""
Write-Host "已分别打开『后端』和『前端』两个窗口，请在各窗口查看安装与启动进度。" -ForegroundColor Cyan
Write-Host "当前端窗口出现 http://localhost:8080/ 后，在浏览器访问即可。" -ForegroundColor Cyan
