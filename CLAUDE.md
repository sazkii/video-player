# Video Player Project

## AI 开发团队

本项目采用多角色 AI 协作开发流程，通过 `/dev-run` 执行全自动开发。

### 快速命令
- `/dev-run` — 全自动开发（读取 PROJECT.md，7阶段流水线）
- `/pm` — 产品经理模式
- `/architect` — 架构师模式
- `/engineer` — 工程师模式（TDD）
- `/reviewer` — 代码审查模式
- `/qa` — 测试模式
- `/security` — 安全审计模式

### 代码规范
- TypeScript strict mode
- React 函数组件 + Hooks
- Tailwind CSS 样式
- 每个组件不超过 200 行
- 自定义 Hook 抽离复杂逻辑
- 中文注释

### 项目结构
```
src/
├── components/    # UI组件
├── hooks/         # 自定义Hook
├── utils/         # 工具函数
├── types/         # TypeScript类型
└── App.tsx        # 根组件
```
