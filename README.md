# CinemaFlow

一个基于 React + Express 的影视聚合播放器，支持多数据源搜索、HLS 流播放、画质切换。

## 功能特性

- **多数据源搜索** — 并行查询多个 CMS API（量子/光速/红牛等），聚合搜索结果
- **HLS 流播放** — 基于 hls.js，支持 M3U8 格式视频流
- **拖动进度条** — 鼠标/触控拖拽快进，实时时间预览
- **画质切换** — 解析 vod_play_from 多源组，支持切换不同清晰度
- **视频加载优化** — 30MB 缓冲区、60s 前向缓冲、下一集预加载
- **备份源容错** — 播放失败时自动切换到其他站点的备份源
- **热播推荐** — 首页展示电影/电视剧/综艺/动漫分类推荐
- **收藏历史** — 收藏管理 + 观看历史记录
- **YouTube 风格播放器** — 倍速/全屏/PiP/手势控制/下一集倒计时

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 |
| 路由 | react-router-dom v7 |
| 视频 | hls.js |
| 后端 | Express 5 + TypeScript |
| 数据库 | sql.js (SQLite WASM) |
| 适配器 | registry + SiteAdapter 接口 |

## 快速开始

### 安装依赖

```bash
npm install
cd server && npm install && cd ..
```

### 启动开发服务器

```bash
# 启动后端 (端口 3000)
cd server && npm run dev

# 启动前端 (端口 5173)
npm run dev
```

### 访问应用

浏览器打开 http://localhost:5173

## 项目结构

```
video-player/
├── server/                     # Express 后端
│   ├── src/
│   │   ├── adapters/           # 数据源适配器
│   │   │   ├── lziapi-cms.ts   # 苹果 CMS JSON API 适配器
│   │   │   ├── generic-collector.ts  # HTML 抓取适配器
│   │   │   └── registry.ts     # 适配器注册中心
│   │   ├── routes/             # API 路由
│   │   │   ├── search.ts       # 搜索/详情/播放源
│   │   │   ├── proxy.ts        # 视频代理
│   │   │   ├── browse.ts       # 分类浏览
│   │   │   ├── user.ts         # 收藏/历史
│   │   │   └── sites.ts        # 站点管理
│   │   ├── db/                 # 数据库
│   │   └── index.ts            # 入口
│   └── data.db                 # SQLite 数据库
├── src/                        # React 前端
│   ├── components/
│   │   ├── PlayerPage/         # 播放器组件
│   │   │   ├── ProgressBar.tsx # 进度条（拖拽）
│   │   │   ├── EpisodeSidebar.tsx  # 剧集侧边栏
│   │   │   └── NextEpisodeOverlay.tsx  # 下一集倒计时
│   │   ├── TrendingSection.tsx # 热播推荐
│   │   └── Navigation.tsx      # 导航栏
│   ├── pages/                  # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── DetailPage.tsx
│   │   ├── PlayerPage.tsx      # 主播放器页面
│   │   ├── FavoritesPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useProgressDrag.ts  # 进度条拖拽
│   │   ├── useGestureControls.ts  # 手势控制
│   │   └── useMediaQuery.ts    # 响应式断点
│   ├── services/api.ts         # API 调用封装
│   ├── types/api.ts            # TypeScript 类型
│   ├── context/                # React Context
│   └── App.tsx                 # 根组件
└── package.json
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/search?q=关键词&page=1` | GET | 搜索影视内容 |
| `/api/search/detail?url=` | GET | 获取详情 |
| `/api/search/sources?url=&episodeUrl=` | GET | 获取播放源 |
| `/api/search/sources-all?url=&episodeIndex=` | GET | 获取所有站点播放源 |
| `/api/browse?category=&page=` | GET | 分类浏览 |
| `/api/proxy?url=` | GET | 视频代理（解决跨域） |
| `/api/user/favorites` | GET | 收藏列表 |
| `/api/user/favorites` | POST | 添加收藏 |
| `/api/user/history` | GET | 观看历史 |

## 数据源适配器

### 苹果 CMS JSON API（LziApiCmsAdapter）

支持标准 Apple CMS 提供商 API 格式：
- 搜索：`GET ?ac=detail&wd=关键词&pg=页码`
- 详情：`GET ?ac=detail&ids=视频ID`
- 播放地址格式：`剧集名$url#剧集名$url#...`

### 已验证数据源

| ID | 名称 | API 地址 |
|----|------|----------|
| lziapi | 量子资源 | `cj.lziapi.com/api.php/provide/vod` |
| guangsuapi | 光速资源 | `api.guangsuapi.com/api.php/provide/vod` |
| hongniuzy2 | 红牛资源 | `www.hongniuzy2.com/api.php/provide/vod` |

## 播放器功能

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Space` / `K` | 播放/暂停 |
| `J` | 后退 10 秒 |
| `L` | 前进 10 秒 |
| `←` / `→` | 前退/后退 5 秒 |
| `↑` / `↓` | 音量 +10% / -10% |
| `F` | 全屏 |
| `M` | 静音 |
| `Esc` | 退出全屏 |

### 移动手势

- 双击左侧：后退 10 秒
- 双击右侧：前进 10 秒
- 左右区垂直滑动：调节音量

## 开发

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## License

MIT
