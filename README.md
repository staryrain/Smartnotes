#  一、产品定位

## 产品名称（暂定）

智能便签 (Smartnotes)

## 产品核心定位

一个：

* 常驻桌面侧边
* 极简美观
* 现代暗黑模式生产力界面风格
* 支持任务管理 + 明日计划 + 长期规划 + 成就记录
* 不干扰操作

的桌面效率工具。

UI 风格参考：
* 现代暗黑模式
* 磨砂/毛玻璃质感
* 控件布局参考提供的实例图片

---

# 🏗 二、技术架构总览（企业级分层）

## 技术栈

* Electron
* React
* TypeScript
* Zustand（状态管理）
* better-sqlite3（本地数据库）
* Axios（网络请求）
* TailwindCSS（UI）
* Framer Motion（动效）

---

## 总体架构图

```
┌────────────────────────────┐
│        Main Process        │
│ 窗口控制 / 托盘管理         │
└────────────┬───────────────┘
             │ IPC Bridge
┌────────────▼───────────────┐
│        Preload Layer       │
│ contextBridge 安全暴露 API │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│      Renderer (React)      │
│ UI / Zustand / Features    │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│        Data Layer          │
│ better-sqlite3 + SQLite    │
└────────────────────────────┘
```

---

# 🖥 三、桌面交互高级特性

## 1️⃣ 鼠标穿透模式 (Mouse Through)

*   **默认状态**：开启穿透（鼠标点击会穿透应用，操作背后窗口）。
*   **切换方式**：点击右上角“鼠标穿透”按钮进行切换（穿透/不穿透）。
*   **交互逻辑**：
    *   穿透模式：无法点击应用内大部分区域，仅特定按钮可响应。
    *   不穿透模式：正常操作应用。

## 2️⃣ 最小化托盘 (Close Strategy)

*   **交互逻辑**：点击右上角关闭（×）按钮。
*   **行为**：不退出应用，而是最小化至桌面任务栏右侧（系统托盘），类似 QQ 的关闭逻辑。
*   **恢复**：点击托盘图标恢复窗口显示。

## 3️⃣ 窗口特性

*   常驻桌面侧边
*   支持透明度调节（设置中配置）

---

# 🧩 四、功能模块设计 (Toolbar)

底部工具栏包含以下 5 个核心功能模块：

## 1. 任务 (Tasks)
*   **功能**：
    *   添加新任务。
    *   展示当前待办任务。
    *   展示长期计划（只读）。
*   **逻辑**：
    *   作为应用的主页，展示当下的核心待办。
    *   长期计划在任务列表中展示，但不可操作（完成/删除），需跳转至“长期计划”页面操作。

## 2. 计划 (Plan)
*   **功能**：
    *   规划明日的任务。
*   **逻辑**：
    *   在此处添加的任务不会立即显示在“任务”页面。
    *   **自动流转**：第二天早晨 06:00，计划中的任务会自动移动到“任务”列表中展示。

## 3. 长期计划 (Long-term)
*   **功能**：
    *   添加长期计划。
    *   管理长期计划（完成、删除）。
*   **逻辑**：
    *   长期计划会同步显示在“任务”页面，起到提醒作用。
    *   所有的编辑、状态更新（完成）、删除操作必须在此页面进行。

## 4. 成就 (Achievements)
*   **功能**：
    *   记录用户达成的成就。
    *   时间轴展示。
*   **交互流程**：
    *   先添加年份 -> 在年份下添加月份 -> 在月份下添加具体成就。
*   **展示样式**：
    *   **成就内容**：大字体，突出显示。
    *   **年份/月份**：小字体。
    *   **时间戳**：每一个成就添加完成后，在文本框右侧显示当前具体时间（精确到小时，例如：10日 19点）。

## 5. 设置 (Settings)
*   **功能**：
    *   **页面透明度**：调节应用背景的透明度，适应不同桌面壁纸。

---

# 🗄 五、数据层设计（SQLite）

## 数据模型设计

使用 better-sqlite3 直接操作 SQLite 数据库。

### DailyTask (任务 & 计划)
*   **id**: TEXT (UUID)
*   **content**: TEXT
*   **status**: TEXT ('PENDING', 'COMPLETED')
*   **type**: TEXT ('TODAY', 'PLAN_TOMORROW')
*   **planDate**: INTEGER (Timestamp)
*   **longTermId**: TEXT (关联 LongTermGoal)
*   **recurringTaskId**: TEXT (关联 RecurringTask)
*   **isPersist**: INTEGER (0 或 1)
*   **createdAt**: INTEGER (Timestamp)
*   **updatedAt**: INTEGER (Timestamp)

### LongTermGoal (长期计划)
*   **id**: TEXT (UUID)
*   **content**: TEXT
*   **status**: TEXT ('PENDING', 'COMPLETED')
*   **createdAt**: INTEGER (Timestamp)

### RecurringTask (循环任务/子任务)
*   **id**: TEXT (UUID)
*   **content**: TEXT
*   **longTermGoalId**: TEXT (关联 LongTermGoal)
*   **createdAt**: INTEGER (Timestamp)

### Achievement (成就)
*   **id**: TEXT (UUID)
*   **year**: INTEGER
*   **month**: INTEGER
*   **content**: TEXT
*   **recordTime**: TEXT (如 "10日 19点")
*   **createdAt**: INTEGER (Timestamp)

---

# 📂 六、推荐目录结构

```
src/
├── main/
│   ├── window/
│   ├── ipc/
│   └── services/
│       ├── task.service.ts
│       ├── plan.service.ts
│       ├── longterm.service.ts
│       └── achievement.service.ts
│
├── renderer/
│   ├── components/
│   │   ├── Toolbar.tsx
│   │   ├── TopBar.tsx (穿透/关闭)
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Tasks.tsx
│   │   ├── Plan.tsx
│   │   ├── LongTerm.tsx
│   │   ├── Achievements.tsx
│   │   └── Settings.tsx
│   └── store/
│       └── useStore.ts
│
└── types/
```

---

# 新增
1.任务置顶功能

2.鼠标拖动任务项换位功能

# 🚀 七、开发与构建指南

## 1. 环境准备

*   **Node.js**: 建议使用 v18.x 或更高版本。
*   **包管理器**: 推荐使用 npm 或 pnpm。
*   **构建工具 (Windows)**: 由于使用了 `better-sqlite3` 原生模块，Windows 用户可能需要安装 Python 和 Visual Studio C++ Build Tools (通常可通过 `npm install --global --production windows-build-tools` 或 Visual Studio Installer 安装)。

## 2. 安装依赖

```bash
npm install
```

> **注意**: 安装过程中会自动执行 `postinstall` 脚本 (`electron-builder install-app-deps`)，确保 `better-sqlite3` 等原生模块针对 Electron 版本进行重新编译。如果安装失败，请检查构建工具是否齐全。

## 3. 启动开发环境

```bash
npm run dev
```

该命令将同时启动 Main Process 和 Renderer Process 的热重载服务。

## 4. 打包构建

根据目标平台选择相应的构建命令：

*   **Windows**:
    ```bash
    npm run build:win
    ```
*   **macOS**:
    ```bash
    npm run build:mac
    ```
*   **Linux**:
    ```bash
    npm run build:linux
    ```

构建产物将输出到 `dist_build` 目录。

## 5. 常见问题排查

*   **better-sqlite3 报错**: 
    *   如果遇到 `Error: The module '...' was compiled against a different Node.js version`，请运行 `npm run postinstall` 手动触发原生模块重编译。
    *   如果 `better-sqlite3` 无法找到绑定文件，请检查 `node_modules/better-sqlite3/build/Release` 目录是否存在。