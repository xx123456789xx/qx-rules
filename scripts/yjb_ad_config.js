/*
 * 养基宝 · 关闭开屏 / 信息流广告位
 * ---------------------------------------------------------------------------
 * 适用：Quantumult X  →  [rewrite_local]  script-response-body
 * 命中：GET https://app-api.yangjibao.com/content/v1/ad/config
 *
 * 原始响应（抓包实测）：
 * {"code":200,"message":"SUCCESS","data":{
 *    "app_id":"81899",
 *    "splash":{"full_mode":true,"close_button":true,"ad_id":"5812156396367453",
 *              "loading_limit_ms":5000,"daily_show_limit":20,
 *              "display_duration_ms":5000,"switch":true},
 *    "feed":{"discover":{...,"position_start":3,"position_end":6,"switch":false}}
 * }}
 *
 * 处理：把 splash 的 switch 关掉、次数上限归零、ad_id 清空；
 *       feed 下所有子位一并关闭。App 收到后直接跳过开屏，不会再去调起广告 SDK。
 * ---------------------------------------------------------------------------
 * 作者：按 HAR 抓包还原，字段与线上一致；服务端若新增广告位，会被下面的
 *      通用兜底逻辑一并关闭。
 */

const body = $response.body;

if (!body) {
  $done({});
} else {
  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    // 非 JSON（例如风控返回 HTML），原样放行，避免把 App 打崩
    $done({});
    obj = null;
  }

  if (obj && obj.data && typeof obj.data === 'object') {
    const d = obj.data;

    // ---------- 1. 开屏广告 ----------
    if (d.splash && typeof d.splash === 'object') {
      d.splash.switch = false;
      d.splash.daily_show_limit = 0;
      d.splash.ad_id = '';
      d.splash.loading_limit_ms = 0;
    }

    // ---------- 2. 信息流 / 发现页广告 ----------
    if (d.feed && typeof d.feed === 'object') {
      Object.keys(d.feed).forEach(function (k) {
        const slot = d.feed[k];
        if (slot && typeof slot === 'object') {
          slot.switch = false;
          slot.ad_id = '';
          if ('position_start' in slot) slot.position_start = 0;
          if ('position_end' in slot) slot.position_end = 0;
        }
      });
    }

    // ---------- 3. 兜底：未来可能新增的广告位容器 ----------
    ['banner', 'popup', 'float', 'interstitial', 'reward', 'ads', 'ad'].forEach(function (k) {
      if (k in d && d[k] && typeof d[k] === 'object') {
        d[k].switch = false;
        if ('ad_id' in d[k]) d[k].ad_id = '';
      }
    });

    $done({ body: JSON.stringify(obj) });
  }
}
