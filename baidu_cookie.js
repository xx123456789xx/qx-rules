// Quantumult X - 百度网盘 Cookie 抓取
// 仅保存到本机 QX 持久化存储；不要分享 Cookie。

const headers = ($request && $request.headers) || {};
const cookie = headers.Cookie || headers.cookie || "";

if (cookie) {
  $prefs.setValueForKey(cookie, "BaiduPan_Cookie");

  const names = cookie.split(";")
    .map(item => item.trim().split("=")[0])
    .filter(Boolean);

  $notify(
    "百度网盘 Cookie",
    "捕获成功",
    "已保存到本机。字段：" + names.join(", ")
  );
} else {
  // 仅提示一次，确认规则已命中但该请求没有 Cookie。
  const warned = $prefs.valueForKey("BaiduPan_NoCookieWarned");
  if (!warned) {
    $prefs.setValueForKey("1", "BaiduPan_NoCookieWarned");
    $notify(
      "百度网盘 Cookie",
      "规则已触发，但请求头没有 Cookie",
      "请登录后访问网盘文件列表；若仍无 Cookie，可能该请求不携带 Cookie。"
    );
  }
}

$done({});
