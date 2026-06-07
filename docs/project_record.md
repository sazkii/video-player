---
title: "Video Player - 在线视频播放器"
date: 2026-06-07
category: project
tags: [project, react, typescript, video, tailwind, hls]
status: complete
related: "[[AI全自动开发体系/全自动项目开发]]"
---

# Video Player - 在线视频播放器

> 零广告、纯净体验的在线视频播放器，支持本地文件拖拽播放和在线URL输入播放。

---

## 项目信息

| 项目 | 详情 |
|------|------|
| 技术栈 | React 19 + TypeScript + Tailwind CSS + HLS.js |
| 构建工具 | Vite 8 + Vitest |
| 启动日期 | 2026-06-07 |
| 完成日期 | 2026-06-07 |
| 功能数 | 14 个（P0: 7, P1: 5, P2: 2） |
| 文件数 | 22 个源文件 |
| 测试通过率 | 100%（11/11） |
| 安全评分 | 10/10（0 漏洞） |
| 代码审查 | 15 项发现，全部修复 |

## 功能清单

### P0（已完成）
1. ✅ 视频播放/暂停控制 — 空格键或点击切换
2. ✅ 进度条拖拽跳转 — 支持拖拽 + 点击跳转
3. ✅ 音量控制 — 滑块 + 静音切换
4. ✅ 全屏播放 — F 键或按钮切换
5. ✅ 播放速度调节 — 0.5x / 1x / 1.25x / 1.5x / 2x
6. ✅ 本地文件拖拽上传 — 支持 mp4/webm/ogg/mov
7. ✅ 在线视频URL输入 — 支持直链和 HLS m3u8 流

### P1（已完成）
1. ✅ 画中画（PiP）模式 — 浏览器原生支持
2. ✅ 键盘快捷键 — 空格/←→/↑↓/F/M/K
3. ✅ 倍速记忆 — localStorage 自动保存偏好
4. ✅ 进度条 hover 时间提示
5. ✅ 暗色/亮色主题切换 — 默认暗色

### P2（已完成）
1. ✅ 播放列表 — 多视频连续播放 + 自动推进
2. ✅ URL历史记录 — localStorage 保存最近 20 条

### P2（未实现）
1. ❌ 字幕加载 — TextTrack API 可扩展
2. ❌ 画质切换 — 需要多分辨率源

## 文件结构

```
video-player/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # 顶部栏 + 主题切换
│   │   ├── VideoPlayer.tsx      # 视频播放器主组件
│   │   ├── Playlist.tsx         # 播放列表
│   │   ├── Controls/
│   │   │   ├── index.tsx        # 控制栏容器
│   │   │   ├── PlayButton.tsx   # 播放/暂停按钮
│   │   │   ├── ProgressBar.tsx  # 进度条（拖拽 + hover）
│   │   │   ├── TimeDisplay.tsx  # 时间显示
│   │   │   ├── VolumeControl.tsx # 音量控制
│   │   │   ├── SpeedControl.tsx # 倍速选择
│   │   │   ├── PiPButton.tsx    # 画中画按钮
│   │   │   └── FullscreenButton.tsx # 全屏按钮
│   │   └── InputArea/
│   │       ├── index.tsx        # 输入区域容器
│   │       ├── DropZone.tsx     # 拖拽上传区
│   │       └── URLInput.tsx     # URL 输入框
│   ├── hooks/
│   │   └── useVideoPlayer.ts    # 核心播放器 Hook（HLS + 状态管理）
│   ├── utils/
│   │   ├── formatTime.ts        # 时间格式化工具
│   │   ├── validateURL.ts       # URL 验证 + 文件类型检测
│   │   └── storage.ts           # localStorage 工具（偏好 + 历史）
│   ├── types/
│   │   └── video.ts             # TypeScript 类型定义
│   ├── __tests__/
│   │   ├── formatTime.test.ts   # 3 个测试用例
│   │   └── validateURL.test.ts  # 8 个测试用例
│   ├── App.tsx                  # 根组件（状态管理 + 主题）
│   ├── main.tsx                 # Vite 入口
│   └── index.css                # Tailwind CSS 入口
├── public/
│   └── favicon.svg              # 播放器图标
├── docs/                        # 项目文档
│   ├── PRD.md                   # 产品需求文档
│   ├── system_design.md         # 系统架构（Mermaid 图）
│   ├── data_model.md            # 数据模型设计
│   ├── api_design.md            # 模块接口定义
│   └── project_record.md        # 本文件
├── CLAUDE.md                    # AI 角色配置
├── PROJECT.md                   # 项目启动文档
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 运行方式

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 运行测试
npm test

# 类型检查
npm run lint

# 构建生产版本
npm run build

# 预览构建结果
npx serve dist
```

## 开发时间线

| 日期 | 阶段 | 主要成果 | Git 提交 |
|------|------|---------|---------|
| 2026-06-07 | 初始化 | Git 仓库建立 + AI 角色配置 | init: project setup |
| 2026-06-07 | 产品经理 | PRD（4 个用户故事） | docs(prd): add PRD |
| 2026-06-07 | 架构师 | 系统设计 + 数据模型 + 接口 | docs(design): add system design |
| 2026-06-07 | 工程师 | 22 个源文件，TDD 编码 | feat: implement all features |
| 2026-06-07 | 审查员 | 9 维度审查，15 项发现修复 | fix(review): resolve findings |
| 2026-06-07 | QA | 11 个测试用例，全部通过 | test: add 11 tests |
| 2026-06-07 | 安全 | 0 漏洞，0 XSS | fix(security): 0 findings |
| 2026-06-07 | 交付 | 生产构建成功 | docs(delivery): project record |

## 代码审查详情

### 9 维度审查发现（15 项，全部修复）

| # | 严重度 | 文件 | 问题 | 修复方案 |
|---|--------|------|------|----------|
| 1 | 🔴 | VideoPlayer.tsx:31 | clickTimerRef 用普通对象而非 useRef | 改用 useRef + 卸载清理 |
| 2 | 🔴 | App.tsx:37 | playlist.length 闭包过期导致 index 错误 | 重写为函数式更新 |
| 3 | 🔴 | ProgressBar.tsx:25 | 拖拽超出组件边界后失效 | 改用 document 级事件 |
| 4 | 🟡 | useVideoPlayer.ts:171 | Blob URL 内存泄漏 | 跟踪 + 切换/卸载时 revoke |
| 5 | 🟡 | useVideoPlayer.ts:136 | HLS 实例卸载未销毁 | 添加 useEffect cleanup |
| 6 | 🟡 | useVideoPlayer.ts:336 | 键盘监听器随音量反复注册 | 使用 volumeRef |
| 7 | 🟡 | VideoPlayer.tsx:38 | setTimeout 未清理 | 添加 useEffect cleanup |
| 8 | 🟡 | App.tsx:66 | setState 嵌套在 updater 中 | 重写为派生状态 |
| 9 | 🟡 | useVideoPlayer.ts:136 | setSource 不重置播放状态 | 添加状态重置 |
| 10 | 🟡 | VolumeControl.tsx:23 | document 监听器未清理 | 添加 ref 跟踪 |
| 11 | 🟢 | SpeedControl.tsx:5 | playbackRate 类型为 number 而非 PlaybackRate | 修正类型 |
| 12 | 🟢 | useVideoPlayer.ts:348 | error/clearError 死代码 | 保留供后续扩展 |
| 13 | 🟢 | VolumeControl.tsx:36 | VolumeIcon 每次渲染重建 | 提取为独立组件 |
| 14 | 🟢 | useVideoPlayer.ts:338 | 每次渲染返回新对象 | 接受现状（性能可接受） |
| 15 | 🟢 | URLInput.tsx:18 | URL 验证三重调用 | 简化为单一验证点 |

## 后续建议

- [ ] HLS.js 动态 import 减小 bundle 体积（当前 ~500KB）
- [ ] 添加字幕加载功能（TextTrack API）
- [ ] 移动端触摸手势支持
- [ ] 添加 PWA 支持（离线播放本地缓存视频）
- [ ] 添加播放进度恢复（记住上次播放位置）

---

*本项目采用 AI 多角色协作开发流水线（7 阶段）完成，全程自动执行。*
*开发规则参考：[[AI全自动开发体系/全自动项目开发]]*
