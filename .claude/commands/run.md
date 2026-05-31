---
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__Claude_Preview__*
---

# 启动开发服务器

启动 Vite 开发服务器并自动打开浏览器预览。

## 执行步骤

1. 检查 package.json 是否存在
2. 执行 `npm run dev` 启动开发服务器
3. 在后台运行，等待用户查看

## 常用操作

- **启动开发**: `npm run dev`
- **构建预览**: `npm run build && npx serve dist`
- **运行测试**: `npm test`
- **代码检查**: `npm run lint`

请检查当前项目状态，如果尚未初始化则先执行 `npm create vite@latest . -- --template react-ts` 初始化项目，然后启动开发服务器。
