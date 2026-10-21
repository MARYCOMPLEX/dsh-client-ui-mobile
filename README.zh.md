# dsh-client-ui-mobile

[English](README.md) · [![test](https://github.com/MARYCOMPLEX/dsh-client-ui-mobile/actions/workflows/test.yml/badge.svg)](https://github.com/MARYCOMPLEX/dsh-client-ui-mobile/actions/workflows/test.yml)

把 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 **Web GUI** 适配到手机上，按标准 DSH 客户端插件的形式发布。

Web 壳是桌面优先的：三栏布局、8px 拖拽手柄、依赖 hover 的交互。在手机上它确实能渲染，但会话被挤在 56px 导轨旁边，输入框还要和软键盘抢空间。这个插件把同一个 URL 变成能用的手机界面——不改壳的源码，不需要二次构建。

> 社区插件，与 DeepSeek 官方无关。基于 `@deepseek-ai/dsh` `0.2.1-rc.2` 开发与测试。

## 手机上的行为

以下全部只在**视口 ≤ 768px** 时生效，更宽的窗口完全不受影响。

| 区域 | 行为 |
| --- | --- |
| 框架 | 三栏收成一栏，中间列拿满整宽 |
| 左栏 | 变成覆盖式抽屉（`min(86vw, 300px)`）+ 半透明遮罩；点会话、点面板、点遮罩都会收起 |
| 底栏 | 56px 导航：**对话 / 会话 / 插件**（插件面板未注册时隐藏）**/ 桌面版** |
| 桌面手柄 | 隐藏 8px 的 `col-resize` 手柄——它不是触摸目标 |
| 右栏 | 强制全屏，不再是一列停靠面板 |
| 输入区 | 统一 16px，避免 iOS 聚焦自动放大；通过 `visualViewport` 把框架高度减去键盘高度 |
| 视口 | `100dvh` 高度 + `env(safe-area-inset-*)`，避开刘海与手势条 |
| 宽内容 | `pre` / `table` 在自己的盒子里横滚，不再撑宽整页 |
| 设置页 | 设置模态框变成全屏面板，188px 的侧边导航改为可横向滚动的胶囊标签条 |

## 安装

### 作为组合包（推荐）

```bash
dsh plugin --profile web add github:MARYCOMPLEX/dsh-client-ui-mobile
```

然后在 **设置 → 插件** 里启用 `mobile-ui` 组合包。启用组合包会把它的 patch 层追加进 profile，自动插入 loader 条目。

要锁定版本（可复现安装）：

```bash
dsh plugin --profile web add "github:MARYCOMPLEX/dsh-client-ui-mobile#v0.1.0"
```

如果你的 profile 关闭了配置热重载，之后重启一次 `dsh web`。

### 作为普通条目

不想用组合包的话，安装包之后自己加一行：

```yaml
# <profile>/cordis.patch.yml
- insert:
    - id: mobile-ui
      name: "dsh-client-ui-mobile"
```

两种方式都要求包已装进 profile（`dsh plugin --profile <name> add …`），否则 loader 无法从 profile 的 `node_modules` 解析到 `dsh-client-ui-mobile`。

## 开关

自适应默认**开启**，并且可以不卸载就关掉：

- 底栏最右侧的 **桌面版** 按钮：关掉当前浏览器的手机布局，底栏消失，右下角留一个 **手机版** 小胶囊用来恢复。
- 选择存在 `localStorage` 的 `dsh-client-ui-mobile.enabled`（`"1"` / `"0"`）。
- URL 逃生口：`?dshm=off` / `?dshm=on` 强制指定并记住。万一样式让页面难以操作，用这个立刻恢复。
- 彻底停用插件：**设置 → 插件** 里关掉，或删掉 loader 条目，GUI 回到出厂状态。

## 实现方式

DSH 客户端插件和壳跑在同一个浏览器运行时里，因此只能通过官方开放的面来扩展：

1. **全局样式表** —— `ctx.effect` 往 `document.head` 追加 `<style>`，卸载时移除，和 `dsh-client-ui-theme` 用的是同一套机制。所有规则都在媒体查询内，并且只作用于插件自己标记过的框架，所以局部挂载失败不会污染桌面布局。
2. **`shell.bottom` 槽位** —— 底栏和胶囊是注册进框架底部行的普通 React 组件，因此底栏参与框架自己的网格，而不是浮在内容上。
3. **`ctx.layout`** —— 底栏读 `panelInfo` 高亮当前面板，调用 `toggleSidebar()` / `selectPanel()` 完成导航。
4. **用 DOM 属性而不是类名定位** —— 壳的 CSS Module 类名按构建哈希（比如 `pI_x6G_frame`），插件改用 `data-dshm-*` 属性标记框架和三列。

### 维护者注意：网格陷阱

抽屉脱离了正常流（`position: fixed`）。CSS 网格在自动排布时会跳过脱离流的元素，于是**中间列会滑进第一条轨道**——那条轨道宽度是 `0px`——整个会话就消失了。插件把三列显式钉住：

```css
[data-dshm-frame] > [data-dshm-col="sidebar"]  { grid-column: 1; grid-row: 1 }
[data-dshm-frame] > [data-dshm-col="center"]   { grid-column: 2; grid-row: 1; min-width: 0 }
[data-dshm-frame] > [data-dshm-col="rightbar"] { grid-column: 3; grid-row: 1; min-width: 0 }
```

冒烟测试里有对应断言，防止以后重构时又静默地变回黑屏。

## 兼容性与限制

- 面向 DSH `0.2.x`。壳的断点、槽位名和 `ctx.layout` 在同一个次版本内稳定，但新版本仍可能挪动底层结构。
- 不依赖哈希类名；钩子只有 `data-shell-bottom`、`data-sidebar-collapsed`、`data-rightbar-col`、`data-sidebar-right-open`，以及 `_handle` 类名后缀。
- 768px 是插件自己的断点；壳的右栏自动全屏阈值是 `< 768`，所以插件针对这个边界补了一层 CSS 全屏。
- 插件能改样式、槽位和布局状态，改不了组件内部行为。输入框的回车发送、原生手势仍由壳决定。
- 在 Android Chrome 上验证过。iOS Safari 的安全区和键盘处理已实现，但没在真机上验证过，欢迎反馈。

## 开发

没有构建步骤，也没有运行时依赖——`lib/client.js` 就是最终产物，直接按 `window.__ModuleLoader__` 约定编写。

```bash
node test/smoke.mjs
```

冒烟测试用桩替代 React、DOM 和 cordis 上下文，断言：模块注册、样式注入、`shell.bottom` 注册、按钮集合与文案、以及上面那套列固定逻辑。

## 许可证

[MIT](LICENSE)
