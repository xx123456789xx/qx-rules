/*
肖恩 AI / go.toter.me · Surge 单账号每日签到 v1.2
公开前端核对日期：2026-11-21。未使用真实账号实测。
v1.2：签到结果附带总余额（me 接口的 quota，含固定/签到额度拆分，
字段据站点公开前端代码核对；签到成功后会再查一次状态取最新余额）。
捕获：只监听 GET /api/auth/me 的成功响应，保存该请求的本站 Cookie。
定时：GET /api/auth/me → 未签到才 POST /api/user/signin。
不保存密码，不抓登录请求，不调用购买/邀请/模型接口；不会自动填写密码。
需要 Surge iOS 5.9+；Cookie 失效后请重新登录并刷新 dashboard。
*/
const ORIGIN = 'https://go.toter.me';
const KEY = 'toter.checkin.session.v1';
const TITLE = '肖恩 AI 签到';
const ME = '/api/auth/me';
const SIGNIN = '/api/user/signin';
const RELOGIN = '请在 Safari 重新登录 go.toter.me，并开启获取规则后刷新工作台。';

function issue(message, kind) {
  const err = new Error(message);
  err.publicMessage = message;
  err.kind = kind || 'other';
  return err;
}
function headerValues(headers, name) {
  const out = [];
  if (Array.isArray(headers)) {
    for (const h of headers) {
      if (h && String(h.field).toLowerCase() === name) out.push(String(h.value));
    }
  } else if (headers && typeof headers === 'object') {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === name) {
        const v = headers[key];
        out.push(...(Array.isArray(v) ? v.map(String) : [String(v)]));
      }
    }
  }
  return out;
}
function goodPair(name, value) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name) && /^[\x21-\x3A\x3C-\x7E]*$/.test(value);
}
function parseCookie(raw) {
  if (typeof raw !== 'string' || raw.length > 16384 || /[\r\n]/.test(raw)) return [];
  const out = [];
  for (const part of raw.split(';')) {
    const p = part.trim(), i = p.indexOf('=');
    if (i < 1 || !goodPair(p.slice(0, i), p.slice(i + 1))) return [];
    out.push({ name: p.slice(0, i), value: p.slice(i + 1), path: '/', expires: 0 });
  }
  return out.length <= 64 ? out : [];
}
function pathMatches(requestPath, cookiePath) {
  return requestPath === cookiePath || requestPath.startsWith(cookiePath.endsWith('/') ? cookiePath : cookiePath + '/');
}
function cookieFor(jar, path) {
  return jar.filter(c => (!c.expires || c.expires > Date.now()) && pathMatches(path, c.path))
    .slice().sort((a, b) => b.path.length - a.path.length)
    .map(c => `${c.name}=${c.value}`).join('; ');
}
function loadSession() {
  try {
    const s = JSON.parse($persistentStore.read(KEY) || 'null');
    if (!s || !Array.isArray(s.jar) || !s.jar.length || s.jar.length > 64 || typeof s.userId !== 'string' || typeof s.captureId !== 'string') return null;
    if (!s.jar.every(c => c && typeof c.name === 'string' && typeof c.value === 'string' && goodPair(c.name, c.value) && typeof c.path === 'string' && c.path.startsWith('/') && typeof c.expires === 'number' && Number.isFinite(c.expires))) return null;
    return s;
  } catch (_) { return null; }
}
function userId(data) {
  const id = data && data.id;
  return (typeof id === 'number' && Number.isFinite(id)) || (typeof id === 'string' && id.trim()) ? String(id) : '';
}
// 仅接受目标站点响应中、域范围合法的 Set-Cookie；不向其他站点发请求。
function receiveCookies(session, headers, requestPath) {
  const now = Date.now();
  for (const header of headerValues(headers, 'set-cookie')) {
    for (const raw of header.split(/,(?=\s*[^;,=\s]+\s*=)/)) {
      const fields = raw.split(';'), pair = fields.shift().trim(), eq = pair.indexOf('=');
      if (eq < 1) continue;
      const name = pair.slice(0, eq), value = pair.slice(eq + 1);
      if (!goodPair(name, value)) continue;
      const attrs = Object.create(null);
      for (const f of fields) {
        const i = f.indexOf('=');
        attrs[(i < 0 ? f : f.slice(0, i)).trim().toLowerCase()] = i < 0 ? '' : f.slice(i + 1).trim();
      }
      if (attrs.domain !== undefined) {
        const domain = attrs.domain.toLowerCase().replace(/^\./, '');
        if (!domain || !('go.toter.me' === domain || 'go.toter.me'.endsWith('.' + domain)) || !domain.includes('.')) continue;
      }
      const defaultPath = requestPath.slice(0, requestPath.lastIndexOf('/')) || '/';
      const path = attrs.path && attrs.path.startsWith('/') ? attrs.path : defaultPath;
      let expires = attrs.expires ? Date.parse(attrs.expires) || 0 : 0;
      if (attrs['max-age'] !== undefined && /^-?\d+$/.test(attrs['max-age'])) {
        expires = now + Number(attrs['max-age']) * 1000;
      }
      session.jar = session.jar.filter(c => !(c.name === name && c.path === path));
      if (!expires || expires > now) session.jar.push({ name, value, path, expires });
    }
  }
  session.jar = session.jar.filter(c => !c.expires || c.expires > now);
  if (session.jar.length > 64) throw issue('站点返回的 Cookie 数量异常，已停止。');
}
function saveUpdated(session) {
  const current = loadSession();
  if (current && current.captureId === session.captureId) {
    if (!$persistentStore.write(JSON.stringify(session), KEY)) throw issue('更新本地会话失败，请检查 Surge 存储。');
  }
}
function capture() {
  // 集成模块用 capture_host 参数控制；关闭后，即使其他规则开启本站 MITM，也不获取会话。
  if (typeof $argument !== 'undefined' && String($argument).trim() !== 'go.toter.me') return;
  if (!/^https:\/\/go\.toter\.me\/api\/auth\/me\/?(?:\?[^#]*)?$/.test($request.url) || String($request.method).toUpperCase() !== 'GET' || Number($response.status) !== 200) return;
  let payload;
  try { payload = JSON.parse($response.body); } catch (_) { return; }
  const id = userId(payload && payload.data);
  if (!payload || payload.success !== true || !id || typeof payload.data.hasSignedInToday !== 'boolean') return;
  const jar = parseCookie(headerValues($request.headers, 'cookie').join('; '));
  if (!jar.length) return;
  const previous = loadSession(), now = Date.now();
  const session = { userId: id, jar, captureId: now + '-' + Math.random().toString(36).slice(2), notifiedAt: previous ? previous.notifiedAt || 0 : 0 };
  receiveCookies(session, $response.headers, ME);
  if (!cookieFor(session.jar, SIGNIN)) return;
  const changed = !previous || previous.userId !== id || cookieFor(previous.jar, SIGNIN) !== cookieFor(session.jar, SIGNIN);
  const notify = changed && now - session.notifiedAt > 60000;
  if (notify) session.notifiedAt = now;
  if (!$persistentStore.write(JSON.stringify(session), KEY)) throw issue('保存 Cookie 失败，请检查 Surge 存储。');
  if (notify) {
    const hint = typeof $argument === 'undefined'
      ? '可以手动运行「肖恩签到」测试。获取后可停用此站点的 MITM 与获取规则。'
      : '可以手动运行「肖恩签到」测试。随后将模块参数 capture_host 改为 off.invalid，保留模块启用。';
    $notification.post(TITLE, '登录会话已保存', hint);
  }
}

function api(session, method, path) {
  return new Promise((resolve, reject) => {
    const cookie = cookieFor(session.jar, path);
    if (!cookie) { reject(issue(`没有可用的登录 Cookie。${RELOGIN}`, 'auth')); return; }
    const headers = { Accept: 'application/json', Cookie: cookie, Referer: ORIGIN + '/dashboard', 'Cache-Control': 'no-cache' };
    if (method === 'post') {
      headers['Content-Type'] = 'application/json';
      headers.Origin = ORIGIN;
    }
    $httpClient[method]({
      url: ORIGIN + path, headers, timeout: 10,
      'auto-redirect': false, 'auto-cookie': false, 'full-header-mode': true
    }, (error, response, raw) => {
      try {
        const status = Number(response && response.status) || 0;
        if (!status) throw issue('请求超时或网络连接失败。', 'network');
        if (status === 401) throw issue(`登录会话已失效。${RELOGIN}`, 'auth');
        if (status === 403) throw issue('站点拒绝请求（403）。请到 Safari 检查账号或人工验证状态。', 'blocked');
        if (status === 429) throw issue('站点请求限流（429），本次不重试。', 'blocked');
        if (status < 200 || status >= 300) throw issue(`接口返回 HTTP ${status}，未重复提交。`, status === 409 || status >= 500 ? 'uncertain' : 'http');
        let payload;
        try { payload = JSON.parse(raw); } catch (_) { throw issue('站点未返回有效 JSON，请到网页检查签到状态。', 'uncertain'); }
        if (error || !payload || typeof payload.success !== 'boolean') throw issue('接口响应格式异常，请到网页核对。', 'uncertain');
        receiveCookies(session, response.headers, path);
        saveUpdated(session);
        if (!payload.success) throw issue('站点未确认操作成功，请到网页查看详情。', 'business');
        resolve(payload);
      } catch (err) { reject(err); }
    });
  });
}
function fmtNum(n) { return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('en-US') : null; }
function balanceText(data) {
  const q = data && fmtNum(data.quota);
  if (q === null) return '';
  const p = fmtNum(data.permanentQuota), d = fmtNum(data.dailyQuota);
  const detail = p !== null && d !== null ? `（固定 ${p} + 今日签到 ${d}）` : '';
  return `当前总余额：${q} 额度${detail}。`;
}
async function getState(session) {
  const payload = await api(session, 'get', ME);
  const id = userId(payload.data);
  if (!id || id !== session.userId) throw issue('返回账号与已保存账号不一致，已停止签到。请重新获取会话。', 'auth');
  if (typeof payload.data.hasSignedInToday !== 'boolean') throw issue('签到状态字段已变化，未盲目提交。', 'format');
  return payload.data;
}
async function checkin() {
  const session = loadSession();
  if (!session) throw issue(`还没有保存登录会话。${RELOGIN}`, 'auth');
  const state = await getState(session);
  if (state.hasSignedInToday) return '今天已经签到，无需重复领取。' + balanceText(state);
  let payload;
  try {
    payload = await api(session, 'post', SIGNIN);
  } catch (err) {
    if (['network', 'uncertain', 'business'].includes(err.kind)) {
      // 提交结果不明确时，只补查状态，绝不自动重发签到 POST。
      let verified;
      try { verified = await getState(session); } catch (_) {}
      if (verified && verified.hasSignedInToday) return '已确认今天完成签到（通过账号状态复核）。' + balanceText(verified);
      throw issue('未能确认本次签到结果，未重复提交；请到网页核对。');
    }
    throw err;
  }
  const bonus = payload.data && payload.data.bonus;
  let msg = typeof bonus === 'number' && Number.isFinite(bonus)
    ? `签到成功，获得 ${bonus.toLocaleString('en-US')} 额度。`
    : '站点已确认签到成功。';
  try { msg += balanceText(await getState(session)); } catch (_) {}
  return msg;
}
(async () => {
  const intercepting = typeof $request !== 'undefined' && typeof $response !== 'undefined';
  try {
    if (intercepting) capture();
    else {
      const message = await checkin();
      console.log(`[${TITLE}] ${message}`);
      $notification.post(TITLE, '', message);
    }
  } catch (error) {
    const message = error && error.publicMessage || '脚本运行失败，请检查 Surge 配置。';
    console.log(`[${TITLE}] ${message}`);
    $notification.post(TITLE, intercepting ? '获取未完成' : '本次未确认签到', message);
  } finally {
    $done(intercepting ? {} : undefined);
  }
})();
