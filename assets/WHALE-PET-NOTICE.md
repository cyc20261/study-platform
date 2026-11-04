# 第三方来源说明

## whale-moe-core.js

- **文件**：`assets/whale-moe-core.js`
- **来源**：[Sutera-Diffusus/dsh-whale-musume](https://github.com/Sutera-Diffusus/dsh-whale-musume)（DeepSeek Harness 鲸鱼娘桌宠插件）
- **作者**：Sutera-Diffusus 及贡献者
- **许可**：MIT License
- **本项目的用法**：原样引入，未修改。它是一份不依赖 DOM 的纯状态机与内容库，提供
  620 条台词、40 项可用成就、好感度/心情/饱食度成长、每日任务、关键词识别、
  接蛋糕与记忆翻牌的小游戏逻辑。
- **本项目的适配层**：`assets/whale/pet-brain.js` 负责把上述内核接到本页面已有的
  3D 鲸鱼（`assets/whale/`）上，包括点击分区、气泡、面板、存档与场景联动。

## 角色形象

本页面的鲸鱼娘形象来自本仓库既有的 `assets/whale/` 素材，与上述开源项目无关。
社区常见的 DeepSeek 鲸鱼娘二创形象通常按 **CC BY-NC-SA 4.0**（署名 · 非商业 ·
相同方式共享）授权，若要将本项目用于商业用途，请自行核对形象素材的授权。

## 关于称呼替换

内核台词中以「主人 / 鲸鱼娘」指代用户和角色，本项目在显示时通过内核自带的
`applyNames()` 替换为「闯子 / 小云」，未改动原始台词文本。
