# Caige

Caige 是一款面向主持人的本地优先猜歌与字符竞猜 PWA。它把题库准备、开字母、整曲判定、回合管理和战况图导出集中在同一个界面中。

[在线使用](https://richadowonosas.github.io/Caige/) · [部署状态](https://github.com/RichadoWonosas/Caige/actions/workflows/deploy-pages.yml)

## 功能

- 支持“猜歌吃鸡”和“出你字母”两种模式。
- 主持人状态板直接展示答案与来源，玩家战况图只在满足条件后揭示。
- 主持人使用“猜对 / 猜错”按钮判定整曲回答。
- 支持 Unicode 字符分类、Alias 归一化、字符强制显示或隐藏。
- 支持题目乱序、恢复顺序、误操作撤销和完整行动记录。
- 可复制或下载紧凑的战况图，并导入、导出 JSON 存档。
- 支持亮色、暗色、跟随系统及可调色相主题。
- 安装为 PWA 后可离线使用；对局数据仅保存在当前设备。

## 本地开发

需要 Node.js 22.12 或更高版本。

```bash
npm ci
npm run dev
```

常用检查：

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

项目为 GitHub Pages 配置了 `/Caige/` 基路径。本地开发地址以 Vite 输出为准，生产预览位于 `/Caige/`。

## GitHub Pages

推送到 `main` 后，[部署工作流](.github/workflows/deploy-pages.yml)会依次安装依赖、运行测试、构建 PWA，并把 `dist/` 发布到 GitHub Pages。仓库的 **Settings → Pages → Source** 需要设置为 **GitHub Actions**。

## 数据与隐私

Caige 不需要服务器数据库。对局和偏好通过浏览器存储保留在本机；只有主持人主动导出存档或战况图时，数据才会离开应用。

## 许可证

本项目以 [MIT License](LICENSE) 发布。
