// Quantumult X - 百度网盘 Cookie 抓取
// 仅在你自己的设备和账号上使用；Cookie 等同于登录凭证，请勿分享。

const headers = ($request && $request.headers) || {};
const cookie = headers.Cookie || headers.cookie || "";

if (cookie) {
  // 保存完整 Cookie，避免遗漏百度网盘新增或变化的字段。
  // Cookie 只写入本机 Quantumult X 持久化存储，不发送到 GitHub。
  $prefs.setValueForKey(cookie, "BaiduPan_Cookie");

  const names = cookie.split(";")
    .map(item => item.trim().split("=")[0])
    .filter(Boolean);

  $notify(
    "百度网盘 Cookie",
    "捕获成功",
    "已保存请求 Cookie（字段：" + names.join(", ") + "）"
  );
}

$done({});
