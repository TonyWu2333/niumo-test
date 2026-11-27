# 牛膜理论 · 牛膜人格测试 NMTI

牛膜理论由吴天卓（tonywu）提出：牛马可以被生活反复摩擦，但不能没有自己的保护膜。

- 理论介绍：https://niumo.tonywu.top/
- 牛膜人格测试：https://niumo.tonywu.top/test/
- 16 种牛膜人格：https://niumo.tonywu.top/types/
- 完整原文：https://tonywu.top/2026/11/27/niumo-theory/

## 测试说明

牛膜理论把人和外界之间的缓冲层分成四层，每一层有厚有薄：

| 层 | 厚 | 薄 |
|---|---|---|
| 时间膜 | B 有界 | O 在线 |
| 情绪膜 | F 过滤 | S 海绵 |
| 评价膜 | I 内参照 | E 外参照 |
| 身份膜 | H 我是我 | W 我是工位 |

20 道题，每层 5 道（含反向计分题），四层组合出 16 种牛膜人格，例如 BFIH 钢化牛膜、OSEW 薄膜牛马。

结果可以通过链接分享，例如 `test/#r=BSEH&s=70,30,25,65`。

## 技术

纯静态 HTML，无依赖，部署在 Vercel（niumo.tonywu.top）；旧地址 tonywu2333.github.io/niumo-test 会自动跳转过来。`index.html` 是理论介绍首页，`test/index.html` 是测试页，`types/index.html` 是 16 种人格的说明页（内容和测试页里的 TYPES 保持一致，改类型描述时两处一起改）。`llms.txt` 给 AI 搜索引擎读。16 种人格形象图在 `img/types/<代码>.webp`，替代文字在测试页的 ALTS 里。

---

牛膜理论由吴天卓（tonywu）提出，引用请注明出处。

旧版黑黄海报风格保存在 git 标签 `poster-style`，恢复方法：`git checkout poster-style -- index.html test/index.html types/index.html`。
