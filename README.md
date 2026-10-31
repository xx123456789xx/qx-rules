# 百度网盘 Cookie 抓取 - Quantumult X

## 文件
- `baidu-pan.conf`：Quantumult X 重写订阅配置
- `baidu_cookie.js`：请求头脚本

## GitHub 部署
1. 在 GitHub 新建一个仓库，例如 `qx-scripts`。
2. 将 `baidu-pan.conf` 和 `baidu_cookie.js` 上传到仓库根目录。
3. 打开 `baidu-pan.conf`，将 `YOUR_GITHUB_USERNAME/YOUR_REPO/main` 替换为你的 GitHub 用户名/仓库名/分支名。
4. 保存后，在 Quantumult X 中通过远程配置/重写资源方式添加：
   `https://raw.githubusercontent.com/你的用户名/你的仓库/main/baidu-pan.conf`

## 使用
1. 在 Quantumult X 中启用对应重写规则和 MitM。
2. 安装并信任 Quantumult X 的 MitM 证书。
3. 打开百度网盘网页并登录，确保请求经过 Quantumult X。
4. 脚本捕获到请求 Cookie 后，会写入本机持久化键 `BaiduPan_Cookie`，并发送不含 Cookie 值的成功通知。

## 重要说明
- 这是配置订阅文件，不是免证书或自动登录工具。
- 本脚本只匹配 `pan.baidu.com` 请求；如果百度网盘 App 使用其他域名或请求没有经过 Quantumult X，可能无法捕获。
- Cookie 是账号登录凭证。不要把 Cookie 值贴到 GitHub、聊天或公开场所。
- GitHub 仓库中只放配置和脚本，不要上传抓取到的 Cookie。
