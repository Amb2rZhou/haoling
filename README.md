<div align="center">

<img src="public/gallery/logo-haoling.png" alt="好灵" height="120" />

# 好灵 HAOLING

**抖音信息流里的轻量玄学疗愈卡片**

Douyin Hackathon 2026

[在线体验 →](https://douyin-hackathon.vercel.app/gallery)

</div>

---

## 是什么

好灵是一组嵌在抖音信息流里的玄学体验卡片。没有生辰八字，没有问题分类，没有心愿输入 —— 用户什么都不需要准备，只需要一个手势。

五种卡片，每张只做一件事：

| 卡片 | 一句话 | 手势 | 体验链接 |
|---|---|---|---|
| 年度关键词 | 丙午年 · 马年大吉 | 双击显化 | [/demo](https://douyin-hackathon.vercel.app/demo) |
| 摇一摇求签 | 摇动手机，抽取你的签 | 摇 | [/](https://douyin-hackathon.vercel.app/) |
| 今日运势卡片 | 综合指数 · 宜忌 · 每日指引 | 撕 | [/xiaoyue](https://douyin-hackathon.vercel.app/xiaoyue) |
| 答案之书 | 心里默念问题 · 翻开书页 | 翻 | [/answer](https://douyin-hackathon.vercel.app/answer) |
| 塔罗占卜 | 滑动牌轮 · 点击抽一张 | 抽 | [/tarot](https://douyin-hackathon.vercel.app/tarot) |

## 产品理念

### 一个手势，一次交托（仪式感的轻交互）

市面上的玄学产品大多要求用户先填生辰、选问题、输入心愿 —— 还没开始，就要先交一份作业。好灵把前置成本全部砍掉。

每张卡片只有一个动作，但每个动作都有自己的手感：摇签筒、撕日历、抽塔罗、翻答案之书、看见自己的那一刻双击显化。从刷到到完成不超过十秒。

但「轻」不等于「没感觉」。抖动、翻飞、翻面，每个动作都被刻意做成有重量的仪式 —— 用户在完成动作的那一刻，已经把焦虑、犹豫、期待，押在了那个手势上。**决策权交给系统，动作权还给用户。**

### 稀缺即期待（条件式推送）

好灵的卡片不会高频出现。五种卡片，各有触发条件：

- **每日运势** —— 只在早晨通勤时段推一次
- **生肖年运** —— 一年只在春节前后推
- **塔罗** —— 只在系统判断用户心理状态足够明确时插入（如连续多日围绕同一类问题刷视频）
- **求签** —— 日常低频，在情绪高点或重要节点加权
- **答案之书** —— 低频随机插入

结果落在两个字：**准** 和 **稀缺**。少出现，但每次正中靶心；今天还没看到的那张卡片，是用户主动打开抖音的额外理由。

## 技术栈

- **前端框架**：React 19 + Vite 6
- **3D / 动效**：@react-three/fiber、@react-three/drei、@react-three/postprocessing、framer-motion
- **样式**：CSS Modules + 原生 CSS（衬线 + 米色 + 朱红）
- **静态页**：Vanilla HTML / CSS / JS（`/answer`、`/tarot`、`/gallery`）
- **部署**：Vercel

## 项目结构

```
.
├── index.html               # React SPA 入口（含 /、/demo、/xiaoyue 路由）
├── src/                     # React 源码
│   ├── shell/               # 抖音外壳（DouyinShell、MockVideo、IframeCard）
│   └── cards/               # 各张卡片组件（Qiuqian、Zodiac…）
├── public/
│   ├── gallery.html         # /gallery 着陆页
│   ├── answer.html          # /answer 答案之书
│   ├── tarot/index.html     # /tarot 塔罗（独立静态页）
│   ├── gallery/             # 着陆页资源（缩略图 + logo）
│   └── video/               # 视频素材
└── vercel.json              # 路由 rewrite 配置
```

## 本地开发

```bash
npm install
npm run dev    # 启动 dev server，默认 https://localhost:5173
npm run build  # 产出 dist/
```

## 部署

`vercel.json` 已配好 rewrites，每个静态 HTML 都有显式映射，其余路径走 SPA fallback：

```bash
vercel build --prod
vercel deploy --prebuilt --prod
```

> 注：直接 `vercel deploy --prod` 偶尔会让远端 build 时漏掉根目录 `index.html` 的改动；遇到这种情况用 `--prebuilt` 流程更稳。

## License

仅作为黑客松演示用途。
