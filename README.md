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

## 推送到已有仓库（vision-biz-dash）

远程仓库：[https://github.com/cody999110/vision-biz-dash](https://github.com/cody999110/vision-biz-dash)

> **结构变化说明**：远程旧版是「前端在根目录」（`src/`、`package.json` 等）；本地已是「前后端一体」 monorepo（`vision-biz-dash-main/` + `backend/`）。推送后仓库会以本地结构为准，根目录会多出 `backend/`、`docs/`、`start.ps1` 等；旧版根目录下的前端文件可删除（内容已在 `vision-biz-dash-main/` 中）。

### 不会上传的内容（已配置 .gitignore）

| 路径 | 说明 |
|------|------|
| `backend/storage/datasets/*.json` | 本地上传的 Campaign 真实数据 |
| `backend/.env` | 本地环境变量 |
| `backend/.venv/` | Python 虚拟环境 |
| `vision-biz-dash-main/node_modules/` | 前端依赖 |

样例 CSV（`backend/samples/`）**可以**提交，供他人演示使用。

### 推荐步骤（保留远程历史）

在项目根目录 `axera_dashboard` 打开 **Git Bash** 或已安装 Git 的终端：

```powershell
cd "d:\工作文档\编程\axera_dashboard"

# 1. 初始化并首次提交（若尚未 init）
git init
git add .
git status   # 确认没有 backend/storage/datasets/*.json
git commit -m "feat: 前后端打通，Campaign 按公司切换，模板导入与看板 API"

# 2. 关联远程并合并旧历史
git remote add origin https://github.com/cody999110/vision-biz-dash.git
git branch -M main
git fetch origin
git pull origin main --allow-unrelated-histories -m "merge: 合并远程旧版前端历史"

# 3. 删除远程遗留的根目录前端文件（已在 vision-biz-dash-main/ 中）
git rm -r src public 2>$null
git rm package.json package-lock.json bun.lock bun.lockb vite.config.ts vitest.config.ts tsconfig*.json tailwind.config.ts postcss.config.js eslint.config.js components.json index.html 2>$null
git commit -m "chore: 移除根目录旧前端，统一为 monorepo 结构" --allow-empty

# 4. 推送
git push -u origin main
```

若第 2 步 `remote add` 提示已存在，改用：

```powershell
git remote set-url origin https://github.com/cody999110/vision-biz-dash.git
```

若第 3 步 `git rm` 报某文件不存在，可忽略，继续 commit。

### 推送前自检

```powershell
git status | Select-String "storage/datasets"   # 不应出现 .json
git status | Select-String "node_modules|\.venv" # 不应出现
```

### 若仍使用 Lovable 同步

Lovable 默认期望前端在仓库根目录。改为 monorepo 后，Lovable 可能无法自动同步；若仍需 Lovable，可只把 `vision-biz-dash-main/` 内变更手动同步到远程根目录（较繁琐），或新建独立仓库专门放后端。
