/*
 * 养基宝 · 去除顶部通知条 / 横向横幅广告
 * ---------------------------------------------------------------------------
 * 适用：Quantumult X  →  [rewrite_local]  script-response-body
 * 命中：GET https://app-api.yangjibao.com/unify_ad
 *
 * 原始响应（抓包实测）：
 * {"code":200,"message":"SUCCESS","data":{
 *    "notice":{"id":1286,"content":"...","type":"ad","code":"...",
 *              "other_wx_app_url":"https://wx.yangjibao.com/...","jump_tip_type":0,...},
 *    "bar":{"id":1287,"content":"...","type":"ad","code":"...",...},
 *    "bubble_notice":null
 * }}
 *
 * 处理：notice / bar / bubble_notice 三个广告位全部置 null。
 *       App 侧走「无广告」分支，顶栏不渲染，也不会留占位空白。
 *
 * 注意：这条路只清广告卡片，不影响 App 的正常公告接口（公告另有 nrds_notice_config）。
 * ---------------------------------------------------------------------------
 */

const body = $response.body;

if (!body) {
  $done({});
} else {
  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    $done({});
    obj = null;
  }

  if (obj && obj.data && typeof obj.data === 'object') {
    const d = obj.data;

    // ---------- 抓包确认存在的 3 个广告位 ----------
    if ('notice' in d) d.notice = null;
    if ('bar' in d) d.bar = null;
    if ('bubble_notice' in d) d.bubble_notice = null;

    // ---------- 兜底：同名字段家族，防止服务端换 key ----------
    Object.keys(d).forEach(function (k) {
      const v = d[k];
      // 只清「带 type:"ad" 标记」的对象，避免误伤正常业务字段
      if (v && typeof v === 'object' && !Array.isArray(v) && v.type === 'ad') {
        d[k] = null;
      }
    });

    $done({ body: JSON.stringify(obj) });
  }
}
