// 星驰 API · Surge 每日签到
// 首次用 Safari 正常登录后，通过「快捷指令 → Surge 运行脚本」传入本站 refresh_token。
// 例：星驰签到 = type=cron,cronexp="5 8 * * *",script-path=xingchi-checkin.js,timeout=60,wake-system=true
// 会话保存在 Surge 的本地持久存储；不在这里填写密码或令牌。

const BASE = 'https://xingchiapi.com/api/v1';
const KEY = 'xingchiapi.checkin.session.v1';
const TITLE = '星驰 API 签到';
const REIMPORT = '请先在 Safari 登录星驰 API，再用快捷指令导入会话。';

function token(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^[!-~]{1,8192}$/.test(text) ? text : '';
}

function failure(message, status, payload) {
  const error = new Error(message);
  error.publicMessage = message;
  error.status = status || 0;
  error.unauthorized = status === 401 || (payload && payload.code === 'UNAUTHORIZED');
  error.already = payload && [payload.reason, payload.code].includes('CHECKIN_ALREADY_CLAIMED');
  return error;
}

function api(method, path, label, accessToken, body) {
  return new Promise((resolve, reject) => {
    const headers = { Accept: 'application/json', 'Accept-Language': 'zh-CN' };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      headers['X-User-UI-Request'] = '1';
    }
    const options = {
      url: BASE + path,
      headers,
      timeout: 10,
      'auto-redirect': false,
      'auto-cookie': false
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    $httpClient[method](options, (error, response, raw) => {
      const status = Number(response && response.status) || 0;
      if (!status) {
        reject(failure(`${label}：无法连接站点或请求超时。`));
        return;
      }
      let payload = null;
      try { payload = JSON.parse(raw); } catch (_) {}
      if (status === 403) {
        reject(failure(`${label}：站点拒绝请求（HTTP 403），请打开网页检查账号或验证状态。`, status));
      } else if (status === 429) {
        reject(failure(`${label}：请求被限流（HTTP 429），本次不重试。`, status));
      } else if (status < 200 || status >= 300) {
        reject(failure(`${label}：HTTP ${status}。`, status, payload));
      } else if (error || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
        reject(failure(`${label}：没有收到有效的 API JSON。`, status));
      } else if ('code' in payload && payload.code !== 0) {
        reject(failure(`${label}：接口返回失败。`, status, payload));
      } else {
        resolve('code' in payload ? payload.data : payload);
      }
    });
  });
}

function readSession() {
  try {
    const value = JSON.parse($persistentStore.read(KEY) || 'null');
    if (!value || !token(value.refreshToken)) return null;
    return {
      accessToken: token(value.accessToken),
      refreshToken: token(value.refreshToken),
      expiresAt: Number(value.expiresAt) || 0
    };
  } catch (_) {
    return null;
  }
}

async function refresh(refreshToken) {
  let next;
  try {
    next = await api('post', '/auth/refresh', '续期登录', '', { refresh_token: refreshToken });
  } catch (err) {
    if (err.unauthorized || err.status === 400) {
      throw failure(`会话无效或已过期。${REIMPORT}`);
    }
    throw err;
  }
  const accessToken = token(next && next.access_token);
  if (!accessToken) throw failure('续期登录：站点未返回有效的访问令牌。');
  const expiresIn = Number(next.expires_in);
  const session = {
    accessToken,
    refreshToken: token(next.refresh_token) || refreshToken,
    expiresAt: Number.isFinite(expiresIn) && expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0
  };
  if (!$persistentStore.write(JSON.stringify(session), KEY)) {
    throw failure('保存会话失败，请检查 Surge 存储后重新导入。');
  }
  return session;
}

async function checkin(accessToken) {
  const path = '/user/checkin';
  const info = await api('get', `${path}?timezone=Asia%2FShanghai`, '查询签到', accessToken);
  if (!info || typeof info.enabled !== 'boolean') throw failure('查询签到：返回格式异常，未提交签到。');
  if (!info.enabled) return '站点当前未开放签到。';
  if (info.claimed_today === true) return '今天已签到，不用重复领取。';

  let result;
  try {
    result = await api('post', path, '提交签到', accessToken);
  } catch (err) {
    if (err.already) return '今天已签到。';
    throw err;
  }
  const amount = result && result.amount;
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return `签到成功，奖励额度：${amount.toFixed(2)}。`;
  }
  if (result && result.status && result.status.claimed_today === true) return '签到成功。';
  throw failure('站点未返回可确认的签到结果，请到网页核对。');
}

async function run() {
  const input = typeof $intent !== 'undefined' && $intent ? $intent.parameter : null;
  const importing = input !== undefined && input !== null && input !== '';
  const seed = token(input);
  if (importing && !seed) throw failure(REIMPORT);

  let session = importing ? null : readSession();
  let renewed = false;
  if (importing || (session && (!session.accessToken || (session.expiresAt && session.expiresAt <= Date.now() + 30000)))) {
    session = await refresh(importing ? seed : session.refreshToken);
    renewed = true;
  }
  if (!session) throw failure(`还没有登录会话。${REIMPORT}`);

  try {
    return await checkin(session.accessToken);
  } catch (err) {
    if (!err.unauthorized) throw err;
    if (renewed) throw failure(`续期后仍未获站点授权。${REIMPORT}`);
    session = await refresh(session.refreshToken);
    try {
      return await checkin(session.accessToken);
    } catch (retryError) {
      if (retryError.unauthorized) throw failure(`续期后仍未获站点授权。${REIMPORT}`);
      throw retryError;
    }
  }
}

(async () => {
  try {
    const message = await run();
    console.log(`[${TITLE}] ${message}`);
    $notification.post(TITLE, '', message);
  } catch (error) {
    const message = (error && error.publicMessage) || '脚本运行出错，请检查 Surge 配置。';
    console.log(`[${TITLE}] ${message}`);
    $notification.post(TITLE, '本次未完成', message);
  } finally {
    $done();
  }
})();
