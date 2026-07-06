# Axera Dashboard 一键启动

## 一键启动（Windows）

在项目根目录执行：

```powershell
.\start.ps1
```

会自动：
1. 创建/使用 Python 虚拟环境并安装后端依赖
2. 安装前端依赖（首次）
3. 启动后端 `http://127.0.0.1:8000`
4. 启动前端 `http://127.0.0.1:8080`

## 使用 Campaign 上传数据

1. 打开前端看板 http://127.0.0.1:8080
2. 右上角切换「数据视图」：演示数据 / 已上传公司
3. 点击 **Campaign 数据** 或空态卡片上的「下载模板 / 上传数据」
4. 填写公司名称 → 选择数据域 → 下载模板 → 上传 CSV
5. 上传成功后顶部自动切换到该公司；未上传的数据域显示空态

## 示例 CSV

- `backend/samples/sample_revenue.csv` — 收入成本样例
- `backend/samples/sample_expense.csv` — 费用样例

## 手动启动

```powershell
# 后端
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000

# 前端（新终端）
cd vision-biz-dash-main
npm run dev
```

前端通过 Vite 代理 `/api` → 后端，无需额外 CORS 配置。

## 仓库说明

远程仓库：[https://github.com/cody999110/vision-biz-dash](https://github.com/cody999110/vision-biz-dash)

本项目为 monorepo 结构：
- `vision-biz-dash-main/` — 前端（Vite + React）
- `backend/` — 后端（FastAPI）
- `docs/` — 设计文档
- `start.ps1` — 一键启动脚本

### 不会提交到 Git 的内容

| 路径 | 说明 |
|------|------|
| `backend/storage/datasets/*.json` | 本地上传的 Campaign 真实数据 |
| `backend/.env` | 本地环境变量 |
| `backend/.venv/` | Python 虚拟环境 |
| `vision-biz-dash-main/node_modules/` | 前端依赖 |

样例 CSV（`backend/samples/`）可提交，供他人演示使用。
