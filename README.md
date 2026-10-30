# Quantumult X 规则集

自用 Quantumult X 规则，按 App 维度维护。所有规则均基于真实 HAR 抓包还原，不做「整域名瞎拦」。

## 养基宝 去广告

### 订阅地址

| 类型 | 用途 | 地址 |
|---|---|---|
| **Snippet（推荐）** | 一条链接含 rewrite + filter + mitm | `https://raw.githubusercontent.com/xx123456789xx/x-x-1234-x-x/main/quantumult-x/yangjibao.snippet` |
| Rewrite | 只要重写，自行管 MITM | `https://raw.githubusercontent.com/xx123456789xx/x-x-1234-x-x/main/quantumult-x/yangjibao.rewrite.conf` |
| Filter | 只要广告域名拦截 | `https://raw.githubusercontent.com/xx123456789xx/x-x-1234-x-x/main/quantumult-x/yangjibao.filter.list` |

国内 raw 访问不稳时，把 `https://raw.githubusercontent.com/xx123456789xx/x-x-1234-x-x/main/` 换成
`https://cdn.jsdelivr.net/gh/xx123456789xx/x-x-1234-x-x@main/` 即可（文件路径不变）。

### 安装

**方式一：Snippet（最省事）**

1. QX → 设置 → 引用（Reference）→ 右上角 `+` → 类型选 **Snippet**
2. 粘贴上表第一行的地址，保存
3. 打开 MITM 开关，确认证书已安装并在系统里信任
4. 重新加载配置，冷启动 App

**方式二：分开引用**

1. 设置 → 引用 → `+` → 类型选 **重写**，粘贴 rewrite 地址
2. 再 `+` 一次 → 类型选 **分流**，粘贴 filter 地址
3. 手动在 `[mitm]` 的 hostname 里追加 `app-api.yangjibao.com`（**追加，别覆盖**）
4. 重新加载配置

### 去掉了什么

抓包实测（107 条请求）只有 3 条广告链路：

| 广告位 | 接口 | 原始值 | 处理 |
|---|---|---|---|
| 开屏 | `app-api.yangjibao.com/content/v1/ad/config` | `switch=true`、`ad_id=5812156396367453`、`daily_show_limit=20` | 改写 JSON：开关 false、次数 0、ad_id 清空 |
| 通知条 / 横幅 | `app-api.yangjibao.com/unify_ad` | `notice{type:"ad"}`、`bar{type:"ad"}` | 置 `null` |
| 第三方 SDK | `sigmob.cn`、`shenshiads.com`、`adn-plus.com.cn`、穿山甲 | 加密二进制，无法改 body | `reject` |

### 说明

- 只拦广告，**不动** `app-api.yangjibao.com` 的业务接口
- 信息流广告服务端本来就是关闭状态，规则里只做防御
- 友盟统计域名（`utoken.umeng.com`、`cnlogs.umeng.com`）默认**不拦**，避免影响崩溃上报
- 若 App 后续上线「看广告领权益」，屏蔽后该类功能点击无响应属预期

### 更新

QX 引用列表下拉即可刷新；或在「引用」里点该条目 → 更新。

## 目录

```
quantumult-x/
  yangjibao.snippet        # 完整片段（推荐）
  yangjibao.rewrite.conf   # 仅重写
  yangjibao.filter.list    # 仅域名拦截
scripts/
  yjb_ad_config.js         # 开屏/信息流改写（脚本版，需托管）
  yjb_unify_ad.js          # 通知条/横幅改写（脚本版）
```
