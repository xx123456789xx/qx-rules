// PingMe Surge: balance + ordinary check-in only.
// Adapted from ZenmoFeiShi/Qx PingMe.js, downloaded 2026-11-19.
// Removed simulated video rewards, fake devices/UAs and full credential logging.
// Account data is stored locally under pingme_surge_accounts_v1.
// Capture once, then DISABLE the http-request capture rule.
// No real service requests were made during conversion/testing.
// v2 (2026-11-20): ignore param-less warm-up captures (empty fingerprint,
// e.g. the app launch call that stored phantom account d41d8cd98f00) and
// purge already-stored phantom accounts at the start of a check-in run.
// v3 (2026-11-20): one entry per email. A fresh capture for an email
// already stored replaces that entry in place (a reinstall changes
// device params and thus the fingerprint, which used to spawn a
// duplicate entry every time). Check-in runs merge same-email
// duplicates only when at least one copy verified (balance query
// succeeded); if every copy failed, nothing is removed.

const scriptName = 'PingMe';
const storeKey = 'pingme_surge_accounts_v1';
const SECRET = '0fOiukQq7jXZV2GRi9LGlO';
function MD5(string) {
  function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function AddUnsigned(lX, lY) {
    const lX4 = lX & 0x40000000, lY4 = lY & 0x40000000, lX8 = lX & 0x80000000, lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) return (lResult & 0x40000000) ? (lResult ^ 0xC0000000 ^ lX8 ^ lY8) : (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function ConvertToWordArray(str) {
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1).fill(0);
    let lBytePosition = 0, lByteCount = 0;
    while (lByteCount < lMessageLength) {
      const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] |= str.charCodeAt(lByteCount) << lBytePosition;
      lByteCount++;
    }
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] |= 0x80 << lBytePosition;
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    let WordToHexValue = '';
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  const x = ConvertToWordArray(string);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a,b,c,d,x[k+0],S11,0xD76AA478); d = FF(d,a,b,c,x[k+1],S12,0xE8C7B756); c = FF(c,d,a,b,x[k+2],S13,0x242070DB); b = FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);
    a = FF(a,b,c,d,x[k+4],S11,0xF57C0FAF); d = FF(d,a,b,c,x[k+5],S12,0x4787C62A); c = FF(c,d,a,b,x[k+6],S13,0xA8304613); b = FF(b,c,d,a,x[k+7],S14,0xFD469501);
    a = FF(a,b,c,d,x[k+8],S11,0x698098D8); d = FF(d,a,b,c,x[k+9],S12,0x8B44F7AF); c = FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1); b = FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a = FF(a,b,c,d,x[k+12],S11,0x6B901122); d = FF(d,a,b,c,x[k+13],S12,0xFD987193); c = FF(c,d,a,b,x[k+14],S13,0xA679438E); b = FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a = GG(a,b,c,d,x[k+1],S21,0xF61E2562); d = GG(d,a,b,c,x[k+6],S22,0xC040B340); c = GG(c,d,a,b,x[k+11],S23,0x265E5A51); b = GG(b,c,d,a,x[k+0],S24,0xE9B6C7AA);
    a = GG(a,b,c,d,x[k+5],S21,0xD62F105D); d = GG(d,a,b,c,x[k+10],S22,0x02441453); c = GG(c,d,a,b,x[k+15],S23,0xD8A1E681); b = GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);
    a = GG(a,b,c,d,x[k+9],S21,0x21E1CDE6); d = GG(d,a,b,c,x[k+14],S22,0xC33707D6); c = GG(c,d,a,b,x[k+3],S23,0xF4D50D87); b = GG(b,c,d,a,x[k+8],S24,0x455A14ED);
    a = GG(a,b,c,d,x[k+13],S21,0xA9E3E905); d = GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8); c = GG(c,d,a,b,x[k+7],S23,0x676F02D9); b = GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a = HH(a,b,c,d,x[k+5],S31,0xFFFA3942); d = HH(d,a,b,c,x[k+8],S32,0x8771F681); c = HH(c,d,a,b,x[k+11],S33,0x6D9D6122); b = HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a = HH(a,b,c,d,x[k+1],S31,0xA4BEEA44); d = HH(d,a,b,c,x[k+4],S32,0x4BDECFA9); c = HH(c,d,a,b,x[k+7],S33,0xF6BB4B60); b = HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a = HH(a,b,c,d,x[k+13],S31,0x289B7EC6); d = HH(d,a,b,c,x[k+0],S32,0xEAA127FA); c = HH(c,d,a,b,x[k+3],S33,0xD4EF3085); b = HH(b,c,d,a,x[k+6],S34,0x04881D05);
    a = HH(a,b,c,d,x[k+9],S31,0xD9D4D039); d = HH(d,a,b,c,x[k+12],S32,0xE6DB99E5); c = HH(c,d,a,b,x[k+15],S33,0x1FA27CF8); b = HH(b,c,d,a,x[k+2],S34,0xC4AC5665);
    a = II(a,b,c,d,x[k+0],S41,0xF4292244); d = II(d,a,b,c,x[k+7],S42,0x432AFF97); c = II(c,d,a,b,x[k+14],S43,0xAB9423A7); b = II(b,c,d,a,x[k+5],S44,0xFC93A039);
    a = II(a,b,c,d,x[k+12],S41,0x655B59C3); d = II(d,a,b,c,x[k+3],S42,0x8F0CCC92); c = II(c,d,a,b,x[k+10],S43,0xFFEFF47D); b = II(b,c,d,a,x[k+1],S44,0x85845DD1);
    a = II(a,b,c,d,x[k+8],S41,0x6FA87E4F); d = II(d,a,b,c,x[k+15],S42,0xFE2CE6E0); c = II(c,d,a,b,x[k+6],S43,0xA3014314); b = II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a = II(a,b,c,d,x[k+4],S41,0xF7537E82); d = II(d,a,b,c,x[k+11],S42,0xBD3AF235); c = II(c,d,a,b,x[k+2],S43,0x2AD7D2BB); b = II(b,c,d,a,x[k+9],S44,0xEB86D391);
    a = AddUnsigned(a,AA); b = AddUnsigned(b,BB); c = AddUnsigned(c,CC); d = AddUnsigned(d,DD);
  }
  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

function getUTCSignDate() {
const now = new Date();
const pad = n => String(n).padStart(2, '0');
return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function normalizeHeaderNameMap(headers) {
const out = {};
Object.keys(headers || {}).forEach(k => out[k] = headers[k]);
return out;
}

function parseRawQuery(url) {
const query = (url.split('?')[1] || '').split('#')[0];
const rawMap = {};
query.split('&').forEach(pair => {
if (!pair) return;
const idx = pair.indexOf('=');
if (idx < 0) return;
const k = pair.slice(0, idx);
const v = pair.slice(idx + 1);
rawMap[k] = v;
});
return rawMap;
}

function fingerprintBase(paramsRaw) {
const drop = { sign:1, signDate:1, timestamp:1, ts:1, nonce:1, random:1, reqTime:1, reqId:1, requestId:1};
return Object.keys(paramsRaw || {}).filter(k =>!drop[k]).sort().map(k => `${k}=${paramsRaw[k]}`).join('&');
}

function fingerprintOf(paramsRaw) {
return MD5(fingerprintBase(paramsRaw)).slice(0, 12);
}

function loadStore() {
const raw = $persistentStore.read(storeKey);
if (!raw) return { version: 1, accounts: {}, order: []};
try {
const obj = JSON.parse(raw);
if (!obj.accounts) obj.accounts = {};
if (!Array.isArray(obj.order)) obj.order = Object.keys(obj.accounts);
return obj;
} catch (e) {
return { version: 1, accounts: {}, order: []};
}
}

function saveStore(store) {
$persistentStore.write(JSON.stringify(store), storeKey);
}

function pickItem(arr, seed) {
return arr[seed % arr.length];
}

function buildSignedParamsRaw(capture) {
const params = {};
Object.keys(capture.paramsRaw || {}).forEach(k => {
if (k!== 'sign' && k!== 'signDate') params[k] = capture.paramsRaw[k];
});
params.signDate = getUTCSignDate();
const signBase = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
params.sign = MD5(signBase + SECRET);
return params;
}

function buildUrl(path, capture) {
const params = buildSignedParamsRaw(capture);
const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
return `https://api.pingmeapp.net/app/${path}?${qs}`;
}

function cloneHeaders(headers) {
const out = {};
Object.keys(headers || {}).forEach(k => out[k] = headers[k]);
return out;
}

function buildHeaders(capture, ua) {
const headers = cloneHeaders(capture.headers || {});
delete headers['Content-Length']; delete headers['content-length'];
delete headers[':authority']; delete headers[':method']; delete headers[':path']; delete headers[':scheme'];
headers['Host'] = 'api.pingmeapp.net';
headers['Accept'] = headers['Accept'] || 'application/json';
Object.keys(headers).forEach(k => {
const lk = k.toLowerCase();
if (lk === 'user-agent' || lk === 'connection' || lk === 'proxy-connection' || lk === 'keep-alive') delete headers[k];
});
headers['User-Agent'] = ua;
headers['Connection'] = 'close';
return headers;
}

function getEmail(acc) {
if (acc && acc.email) return acc.email;
const raw = acc && acc.capture && acc.capture.paramsRaw? (acc.capture.paramsRaw.email || ''): '';
try { return decodeURIComponent(raw);} catch (e) { return raw;}
}

function notify(title, body) {
console.log(`${title}\n${body}`);
$notification.post(scriptName, title, body);
}

function isDeregistered(msg) {
return typeof msg === 'string' && msg.indexOf('已被注销')!== -1;
}

function removeAccounts(store, ids) {
const removed = [];
ids.forEach(id => {
if (store.accounts[id]) {
const em = getEmail(store.accounts[id]);
removed.push((store.accounts[id].alias || id) + (em? `(${em})`: ''));
delete store.accounts[id];
}
const pos = store.order.indexOf(id);
if (pos!== -1) store.order.splice(pos, 1);
});
return removed;
}

function sleep(ms) {
return new Promise(r => setTimeout(r, ms));
}

function runAccount(acc, index, total) {
  const email = getEmail(acc);
  const tag = `[账号${index+1}/${total} ${acc.alias || acc.id}]`;
  const ua = acc.baseUA || 'PingMe';
  const headers = buildHeaders(acc.capture, ua);
  const msgs = [`${tag}${email ? `\n📧 ${email}` : ''}`];
  const flag = { deregistered: false };
  let queryOk = false;

  function fetchApi(path) {
    return new Promise((resolve, reject) => {
      $httpClient.get({url: buildUrl(path, acc.capture), headers, timeout: 15},
        (error, response, data) => {
          if (error) return reject(new Error('网络请求失败'));
          const status = response && (response.status || response.statusCode);
          if (status && (status < 200 || status >= 300)) {
            return reject(new Error('HTTP ' + status));
          }
          resolve({body: data});
        });
    });
  }

  return fetchApi('queryBalanceAndBonus').then(res => {
    try {
      const d = JSON.parse(res.body);
      if (d.retcode === 0) { msgs.push(`💰 余额：${d.result.balance} Coins`); queryOk = true; }
      else {
        msgs.push(`⚠️ 查询：${d.retmsg}`);
        if (isDeregistered(d.retmsg)) flag.deregistered = true;
      }
    } catch (e) { msgs.push('❌ 查询：解析失败'); }
    if (flag.deregistered) return null;
    return fetchApi('checkIn');
  }).then(res => {
    if (flag.deregistered || !res) return null;
    try {
      const d = JSON.parse(res.body);
      if (d.retcode === 0) msgs.push(`✅ 签到：${(d.result?.bonusHint || d.retmsg || '').replace(/\n/g, ' ')}`);
      else {
        msgs.push(`⚠️ 签到：${d.retmsg}`);
        if (isDeregistered(d.retmsg)) flag.deregistered = true;
      }
    } catch (e) { msgs.push('❌ 签到：解析失败'); }
    if (flag.deregistered) return null;
    return null; // No simulated video rewards.
  }).then(() => {
    if (flag.deregistered) {
      msgs.push('🗑 该账号已注销，将从存储中移除');
      return null;
    }
    return fetchApi('queryBalanceAndBonus');
  }).then(res => {
    if (res) {
      try {
        const d = JSON.parse(res.body);
        if (d.retcode === 0) msgs.push(`💰 最新余额：${d.result.balance} Coins`);
      } catch (e) {}
    }
    return { text: msgs.join('\n'), deregistered: flag.deregistered, ok: queryOk };
  }).catch(err => {
    msgs.push(`❌ 异常：${err.error || String(err)}`);
    return { text: msgs.join('\n'), deregistered: false, ok: false };
  });
}

const isCaptureReq = typeof $request !== 'undefined' && $request;
if (isCaptureReq && !fingerprintBase(parseRawQuery($request.url))) {
  console.log('PingMe: ignored param-less capture (app warm-up call); not stored.');
  $done({});
} else if (isCaptureReq) {
  const paramsRaw = parseRawQuery($request.url);
  const headersMap = normalizeHeaderNameMap($request.headers || {});
  let baseUA = '';
  Object.keys(headersMap).forEach(k => { if (k.toLowerCase() === 'user-agent') baseUA = headersMap[k]; });

  const store = loadStore();
  const fp = fingerprintOf(paramsRaw);
  const now = Date.now();
  let email = '';
  try { email = decodeURIComponent(paramsRaw.email || ''); } catch (e) { email = paramsRaw.email || ''; }
  const emailKey = email.trim().toLowerCase();
  const dupIds = emailKey ? store.order.filter(id => id !== fp && store.accounts[id] && getEmail(store.accounts[id]).trim().toLowerCase() === emailKey) : [];
  const existed = !!store.accounts[fp];
  const prior = existed ? store.accounts[fp] : (dupIds.length ? store.accounts[dupIds[dupIds.length - 1]] : null);
  const uaSeed = prior ? prior.uaSeed : store.order.length;
  const alias = prior ? prior.alias : `账号${store.order.length + 1}`;
  let insertPos = -1;
  if (!existed && dupIds.length) insertPos = store.order.indexOf(dupIds[0]);
  if (dupIds.length) {
    dupIds.forEach(id => { delete store.accounts[id]; });
    store.order = store.order.filter(id => dupIds.indexOf(id) === -1);
  }

  store.accounts[fp] = {
    id: fp,
    alias,
    email,
    uaSeed,
    baseUA,
    capture: { url: $request.url, paramsRaw, headers: headersMap },
    createdAt: prior ? prior.createdAt : now,
    updatedAt: now
  };
  if (!existed) {
    if (insertPos !== -1) store.order.splice(insertPos, 0, fp);
    else store.order.push(fp);
  }
  saveStore(store);

  const total = store.order.length;
  notify(prior ? '🔄 账号参数已更新' : '✅ 新账号已入库', `${alias}（id:${fp}）${email ? `\n📧 ${email}` : ''}\n当前账号总数：${total}`);
  console.log('PingMe: account capture saved; credentials omitted.');
  $done({});
} else {
  const store = loadStore();
  const phantomIds = store.order.filter(id => store.accounts[id] && !fingerprintBase(store.accounts[id].capture ? store.accounts[id].capture.paramsRaw : {}));
  if (phantomIds.length) {
    removeAccounts(store, phantomIds);
    saveStore(store);
    console.log(`PingMe: purged ${phantomIds.length} phantom account(s): ${phantomIds.join(', ')}`);
  }
  const ids = store.order.filter(id => store.accounts[id]);
  if (!ids.length) {
    notify('⚠️ 未抓到任何账号', '请启用账号获取脚本，打开 PingMe 余额页面；获取成功后禁用获取脚本。');
    $done();
  } else {
    const total = ids.length;
    const results = [];
    const deadIds = [];
    const okIds = [];
    let chain = Promise.resolve();
    ids.forEach((id, idx) => {
      chain = chain.then(() => runAccount(store.accounts[id], idx, total))
        .then(r => {
          results.push(r.text);
          if (r.deregistered) deadIds.push(id);
          if (r.ok) okIds.push(id);
        })
        .then(() => idx < ids.length - 1 ? sleep(1000) : null);
    });
    chain.then(() => {
      let extra = '';
      const freshStore = loadStore();
      let storeChanged = false;
      if (deadIds.length) {
        const removed = removeAccounts(freshStore, deadIds);
        if (removed.length) { storeChanged = true; extra = `\n———\n🗑 已移除注销账号：${removed.join('、')}（剩余${freshStore.order.length}个）`; }
      }
      const okSet = {};
      okIds.forEach(id => { okSet[id] = 1; });
      const groups = {};
      freshStore.order.forEach(id => {
        const acc = freshStore.accounts[id];
        if (!acc) return;
        const ek = getEmail(acc).trim().toLowerCase();
        if (!ek) return;
        (groups[ek] = groups[ek] || []).push(id);
      });
      const mergeIds = [];
      Object.keys(groups).forEach(ek => {
        const g = groups[ek];
        if (g.length < 2) return;
        const okMembers = g.filter(id => okSet[id]);
        if (!okMembers.length) return;
        let keep = okMembers[0];
        okMembers.forEach(id => {
          if ((freshStore.accounts[id].updatedAt || 0) >= (freshStore.accounts[keep].updatedAt || 0)) keep = id;
        });
        g.forEach(id => { if (id !== keep) mergeIds.push(id); });
      });
      if (mergeIds.length) {
        const removedM = removeAccounts(freshStore, mergeIds);
        if (removedM.length) { storeChanged = true; extra += `\n———\n🧹 已合并同邮箱重复账号：${removedM.join('、')}（剩余${freshStore.order.length}个）`; }
      }
      if (storeChanged) saveStore(freshStore);
      notify(`🎉 全部完成 (${total}个账号)`, results.join('\n———\n') + extra);
      $done();
    }).catch(err => {
      notify('❌ 任务异常', results.join('\n———\n') + '\n' + (err.error || String(err)));
      $done();
    });
  }
}
