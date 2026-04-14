<div align="center">

<img src="docs/logo.png" alt="韬奋·纪念" width="120" />

# 韬奋·纪念

**沉浸式数字叙事平台 —— 关于邹韬奋的数字化文化传承**

<img src="docs/shanghai_library_logo.png" alt="上海图书馆" height="40" />

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## 项目简介

本项目致力于打造一个关于**邹韬奋**的沉浸式数字叙事平台，通过现代 Web 技术重现这位伟大新闻出版家、社会活动家的人生历程和思想遗产。项目融合 AI 智能解读、IIIF 国际图像标准、视差滚动等前沿技术，为用户提供直观、沉浸的历史文化体验。

<div align="center">
<img src="docs/首页.jpg" alt="首页预览" width="800" />
</div>

> 作品演示视频：[作品演示.mp4](docs/作品演示.mp4)
>
> 功能模块截图详见：[韬奋·纪念-各功能模块截图.pdf](docs/韬奋·纪念-各功能模块截图.pdf)

---

## 功能展示

### 首页瀑布流

多张历史照片组成的动态瀑布流，配合视差滚动与流动拼贴效果，打造沉浸式第一印象。图片懒加载与预加载策略保障流畅体验。

### 人生大事时间轴

纵向时间轴清晰呈现邹韬奋人生重要节点，从求学、办报到抗日救亡，快速导航特定历史时期，结合图片、文字等多媒体内容。

### 生活书店

横轴时间 + 纵向堆叠的书籍时间线，缩略图卡片式陈列邹韬奋创办的生活书店出版物，点击可查看书籍详情。

### 韬奋手迹

采用 IIIF 国际图像互操作框架，支持高清图像查看与缩放。集成 GLM 大语言模型，对手写文字进行智能识别与白话解读，让百年手稿走进当代语境。

### 报刊文章

邹韬奋相关报刊文章的系统化归档，支持按时间、主题、关键词筛选，提供优化的阅读体验。

### 人际关系网络

基于 D3.js 的社交网络可视化，呈现邹韬奋与同时代文化名人、政治人物的关联图谱，支持互动探索与人物详情查看。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Vite · TailwindCSS · Framer Motion |
| 可视化 | D3.js · Masonry 瀑布流布局 |
| 后端 | Node.js · Express · 内存缓存 |
| 图像服务 | IIIF (Cantaloupe) |
| AI 服务 | GLM 大语言模型 |
| 部署 | Docker · Caddy |

---

<div align="center">

**用技术传承文化**

本项目采用 [MIT](LICENSE) 许可证

</div>
