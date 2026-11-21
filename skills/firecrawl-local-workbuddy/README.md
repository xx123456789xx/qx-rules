# Firecrawl Local 技能包（WorkBuddy 版）

这个包给腾讯 WorkBuddy 用，内容是：

- `SKILL.md` 技能本体，教 WorkBuddy 怎么在本机用 Firecrawl Local 抓网页
- `scripts/firecrawl_local.ps1` Windows PowerShell 辅助脚本
- `mcp.json.example` 可选的 MCP 连接器配置片段

## 第一步：装技能（二选一）

本地包：WorkBuddy 左侧「专家·技能·连接器」→「技能」页签 →「添加技能」→「上传技能」，选 `firecrawl-local-workbuddy.zip` 导入，在「已安装」里确认已启用。

GitHub 链接：在 WorkBuddy 对话里直接说「请安装这个技能：https://github.com/xx123456789xx/qx-rules/tree/main/skills/firecrawl-local-workbuddy ，保留 SKILL.md、scripts/ 的相对位置」，装完在「已安装」里确认已启用。

只装技能只是教会 WorkBuddy 方法，本机还没装 Firecrawl 本体时它抓不了，要做第二步。

## 第二步：在这台 Windows 电脑装 Firecrawl Local 本体

1. 装 Rust：从 https://rustup.rs 下载 rustup-init.exe 运行，或 PowerShell 运行 `winget install --id Rustlang.Rustup`，装完重开 PowerShell
2. 装 Visual Studio Build Tools，勾选「使用 C++ 的桌面开发」
3. PowerShell 运行 `cargo install firecrawl-local`（源码编译，几分钟到几十分钟）
4. 验证：`firecrawl-local --version`
5. 检查环境：在技能目录下运行 `powershell -ExecutionPolicy Bypass -File .\scripts\firecrawl_local.ps1 check`

抓 JavaScript 页面需要本机有 Chrome 或 Chromium。MCP 模式另外需要 Node.js 22 以上。

## 第三步（可选）：让 WorkBuddy 直接调用工具

WorkBuddy 左侧「专家·技能·连接器」→「连接器」页签 →「自定义连接器」→ 配置 MCP，把 `mcp.json.example` 里的 `firecrawl-local` 一项合并进已有的 `mcpServers`（不要整份覆盖掉你已有的其他服务），保存并启用，新建任务后生效。

注意：`firecrawl-local init` 不支持 WorkBuddy，不要对 WorkBuddy 运行它，手动配 MCP 就行。

## 试一句

新建任务后对 WorkBuddy 说：

> 用 firecrawl-local 技能，完全本地模式抓取 https://example.com，转成 Markdown 给我，并注明这次有没有走云端。

看到它先跑版本检查、再抓取、最后注明 FIRECRAWL_CLOUD 的值，就是装对了。
