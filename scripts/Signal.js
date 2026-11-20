/* Signal v3: Surge native summary + local web dashboard.
 * Public page checks only. No login, user cookies, MITM, analytics or storage.
 * GET / is local HTML; GET /probe runs the same four public webpage checks.
 * HTTPS platform probes use existing Surge routing unless policy=... is set.
 */
(function () {
  'use strict';
  var req = typeof $request === 'undefined' ? null : $request;
  function localReply(status, type, body) {
    $done({response: {status:status, headers:{
      'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store',
      'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
      'X-Frame-Options':'DENY',
      'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    }, body:body}});
  }
  if (req) {
    var match=/^http:\/\/192\.0\.2\.1(?::80)?\/(probe)?(?:\?[^#]*)?$/i.exec(req.url||'');
    if(!match){localReply(404,'text/plain','Signal local page. Open / or /probe.');return;}
    if(req.method!=='GET'){localReply(405,'text/plain','Method not allowed');return;}
    if(!match[1]){localReply(200,'text/html',"<!doctype html>\n<html lang=\"zh-CN\" data-mode=\"live\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n<meta name=\"color-scheme\" content=\"light\">\n<meta name=\"theme-color\" content=\"#f4f7f6\">\n<title>Signal · 节点体检</title>\n<style>\n:root{--bg:#f4f7f6;--ink:#182329;--muted:#829099;--soft:#a9b5b8;--line:#e4eae8;--card:#fff;--mint:#2d8f78;--mint-pale:#e4f3ee;--amber:#af7028;--amber-pale:#fff4e5;--red:#b84c58;--red-pale:#fff0f1;--shadow:0 16px 42px rgba(34,60,57,.07)}\n*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;min-height:100vh;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"SF Pro Text\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;background:radial-gradient(ellipse 400px 260px at 90% -30px,#dff1eb 0%,transparent 72%),var(--bg)}\nsvg{display:block;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.sprite{position:absolute;width:0;height:0;overflow:hidden}\n.shell{width:min(100%,520px);margin:auto;padding:max(25px,env(safe-area-inset-top)) 18px max(26px,env(safe-area-inset-bottom))}\n.topbar{height:44px;display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.brand{display:flex;align-items:center;gap:10px}.brand-mark{display:grid;place-items:center;width:33px;height:33px;border-radius:10px;background:#17302c;color:#b2ead9}.brand-mark svg{width:19px;height:19px}.wordmark{font-size:15px;font-weight:800;letter-spacing:.19em}.brand-sub{display:block;color:var(--muted);font-size:10px;letter-spacing:.06em;margin-top:2px}.live{display:flex;align-items:center;gap:6px;border:1px solid #dbe5e2;border-radius:99px;padding:7px 10px;color:#6c7c80;font-size:10px;letter-spacing:.09em;background:#ffffff9c}.live i{width:6px;height:6px;border-radius:50%;background:#49b697;box-shadow:0 0 0 3px #d9f1e9}\n.hero{position:relative;overflow:hidden;border:1px solid #e1e9e6;border-radius:25px;background:var(--card);box-shadow:var(--shadow)}.hero:after{content:\"\";position:absolute;z-index:0;right:-86px;top:-96px;width:260px;height:260px;border:1px solid #cce9df;border-radius:50%;box-shadow:0 0 0 26px #e8f5f0,0 0 0 52px #f3faf8;opacity:.9}.hero-main,.hero-bottom{position:relative;z-index:1}.hero-main{min-height:161px;padding:23px 22px 21px;display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.eyebrow{margin:0 0 9px;color:var(--mint);font-size:10px;font-weight:780;letter-spacing:.15em}.title{margin:0;font-size:30px;letter-spacing:-.07em;line-height:1.16;font-weight:760}.subtitle{margin:8px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.score{text-align:right;flex:none;padding-top:4px}.score-number{font-size:47px;line-height:.9;letter-spacing:-.1em;font-weight:760;color:#1d564b}.score-den{color:#9aacae;font-size:13px;margin-left:3px}.score-label{margin-top:8px;color:#7c8d90;font-size:10px}.progress{height:5px;margin:0 22px 18px;border-radius:9px;background:#edf2f0;overflow:hidden}.progress span{display:block;height:100%;width:75%;border-radius:inherit;background:linear-gradient(90deg,#61c5aa,#b1e6d5);transition:width .35s ease}.hero-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:58px;padding:10px 12px 10px 22px;border-top:1px solid #edf1f0;background:#fcfdfd}.route{display:flex;align-items:center;min-width:0;gap:8px;color:#738489;font-size:12px}.route svg{width:17px;height:17px;color:#76aa9c;flex:none}.route span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.scan{height:35px;display:flex;align-items:center;gap:6px;border:1px solid #2c8e77;border-radius:10px;padding:0 12px;background:#2f927a;color:white;font:inherit;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 5px 12px #2f927a25;-webkit-tap-highlight-color:transparent}.scan svg{width:14px;height:14px;stroke-width:2}.scan:active{transform:scale(.97)}.scan:disabled{opacity:.55;cursor:progress}.scan:disabled svg{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}\n.section-head{display:flex;align-items:end;justify-content:space-between;margin:25px 3px 11px}.section-title{margin:0;font-size:18px;letter-spacing:-.04em;font-weight:740}.updated{text-align:right;color:var(--muted);font-size:10px;line-height:1.35}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none}.card{min-height:151px;display:flex;flex-direction:column;justify-content:space-between;padding:15px;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:0 8px 25px rgba(38,65,61,.035);transition:border-color .2s,transform .2s}.card[aria-busy=true]{opacity:.7}.card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.service-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;color:var(--accent);background:var(--accent-pale)}.service-icon svg{width:22px;height:22px}.netflix{--accent:#ca5867;--accent-pale:#fff0f2}.disney{--accent:#527fc2;--accent-pale:#edf3ff}.youtube{--accent:#d45e66;--accent-pale:#fff0f1}.gpt{--accent:#368d76;--accent-pale:#eaf7f2}.service-tag{color:#a2afb1;font-size:9px;line-height:1.3;text-align:right}.service-name{margin-top:12px;font-size:14px;font-weight:740;letter-spacing:-.025em}.service-hint{margin-top:4px;color:var(--muted);font-size:10px}.card-bottom{display:flex;align-items:end;justify-content:space-between;gap:6px;margin-top:16px}.badge{display:flex;align-items:center;gap:4px;max-width:calc(100% - 44px);padding:5px 7px;border-radius:7px;background:#f0f4f3;color:#718083;font-size:10px;font-weight:670;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.badge svg{width:11px;height:11px;flex:none;stroke-width:2.2}.badge[data-state=reachable]{background:var(--mint-pale);color:var(--mint)}.badge[data-state=warn],.badge[data-state=timeout]{background:var(--amber-pale);color:var(--amber)}.badge[data-state=blocked],.badge[data-state=error]{background:var(--red-pale);color:var(--red)}.latency{color:#9aa8aa;font-size:10px;white-space:nowrap}.detail{margin-top:5px;color:#92a0a2;font-size:10px}.note{display:flex;align-items:flex-start;gap:7px;margin:15px 3px 0;color:#99a6a8;font-size:10px;line-height:1.55}.note svg{width:14px;height:14px;flex:none;margin-top:1px}.message{margin-top:10px;padding:9px 11px;border:1px solid #efd9b7;border-radius:10px;background:#fff7ea;color:#a66a2a;font-size:11px;line-height:1.5}.message[hidden]{display:none}\n@media(max-width:350px){.shell{padding-left:14px;padding-right:14px}.hero-main{padding-inline:17px}.hero-bottom{padding-left:17px}.card{padding:12px;min-height:146px}.service-name{font-size:13px}.score-number{font-size:42px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}\n</style>\n</head>\n<body>\n<svg class=\"sprite\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><defs>\n<symbol id=\"wave\" viewBox=\"0 0 24 24\"><path d=\"M2 12h5l2.8-6.5L14 18l2.8-6H22\"/></symbol>\n<symbol id=\"route\" viewBox=\"0 0 24 24\"><circle cx=\"6\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"18\" r=\"2.5\"/><path d=\"M8.5 6h5.5a3 3 0 010 6h-5a3 3 0 000 6H15\"/></symbol>\n<symbol id=\"refresh\" viewBox=\"0 0 24 24\"><path d=\"M20 6v5h-5M20 11a8 8 0 10-1.7 6\"/></symbol>\n<symbol id=\"check\" viewBox=\"0 0 24 24\"><path d=\"M5 12l4 4L19 6\" stroke-width=\"2.4\"/></symbol>\n<symbol id=\"alert\" viewBox=\"0 0 24 24\"><path d=\"M12 5v9m0 4h.01\" stroke-width=\"2.7\"/></symbol>\n<symbol id=\"closed\" viewBox=\"0 0 24 24\"><path d=\"M6 6l12 12m0-12L6 18\" stroke-width=\"2.3\"/></symbol>\n<symbol id=\"dash\" viewBox=\"0 0 24 24\"><path d=\"M6 12h12\" stroke-width=\"2.5\"/></symbol>\n<symbol id=\"netflix\" viewBox=\"0 0 24 24\"><path d=\"M5.5 21.2V2.8h4l.1 17.8-4.1.6zm8.9-1V2.8h4v18.7l-4-1.3z\" fill=\"currentColor\" stroke=\"none\" opacity=\".76\"/><path d=\"M5.5 2.8h4l8.9 18.7-4-.8L5.5 2.8z\" fill=\"currentColor\" stroke=\"none\"/></symbol>\n<symbol id=\"disney\" viewBox=\"0 0 24 24\"><path d=\"M3 10.6a10.5 10.5 0 0117-3.8M10.2 9v10.3c-3.6.2-5.6-.9-4.8-2.9.8-2.2 6.8-2.6 8.5-1 1.4 1.3.6 3.4-3.4 3.9m6.9-8.5v6.1m-3-3h6\"/></symbol>\n<symbol id=\"youtube\" viewBox=\"0 0 24 24\"><rect x=\"2.3\" y=\"5.2\" width=\"19.4\" height=\"13.6\" rx=\"4\"/><path d=\"M10 9l5 3-5 3V9z\" fill=\"currentColor\" stroke=\"none\"/></symbol>\n<symbol id=\"gpt\" viewBox=\"0 0 24 24\"><path d=\"M12 12c-1.6-2.6-4.8-2-4.8.5a3.2 3.2 0 004.8 2.9m0-3.4c2.3-1.8 1.8-4.7-1-4.7a3.4 3.4 0 00-3.3 3.1m4.3 1.6c2.8 1.4 5.3-.5 4-3a3.5 3.5 0 00-4-1.7m0 4.7c.2 2.9 3.2 4.4 4.8 2.1a3.4 3.4 0 00-.5-4.3M12 2.7l2.7 1.9 3.1.5 1.2 3 2.6 2.1.1 3.4-2.4 2.3-.8 3-3.4.9-2.9 1.7-3.1-1.6-3.2-.5-1.4-3.1-2.2-2.2.2-3.5L4.9 8.3l1-3.1 3.4-1 2.7-1.5z\"/></symbol>\n</defs></svg>\n<main class=\"shell\">\n<header class=\"topbar\"><div class=\"brand\"><div class=\"brand-mark\"><svg aria-hidden=\"true\"><use href=\"#wave\"/></svg></div><div><span class=\"wordmark\">SIGNAL</span><span class=\"brand-sub\">流媒体与 AI</span></div></div><div class=\"live\"><i></i><span id=\"mode\">设计预览</span></div></header>\n<section class=\"hero\" aria-label=\"检测摘要\"><div class=\"hero-main\"><div><p class=\"eyebrow\">NODE HEALTH</p><h1>节点体检</h1><p id=\"summary\" class=\"subtitle\">四个平台，一眼看清</p></div><div class=\"score\"><span id=\"count\" class=\"score-number\">—</span><span class=\"score-den\">/ 4</span><p class=\"score-label\">网页可达</p></div></div><div class=\"progress\"><span id=\"progress\"></span></div><div class=\"hero-bottom\"><div class=\"route\"><svg aria-hidden=\"true\"><use href=\"#route\"/></svg><span id=\"route-name\">现有分流</span></div><button id=\"scan\" class=\"scan\" type=\"button\"><svg aria-hidden=\"true\"><use href=\"#refresh\"/></svg><span id=\"scan-label\">演示刷新</span></button></div></section>\n<p id=\"message\" class=\"message\" role=\"alert\" hidden></p>\n<section aria-labelledby=\"services-heading\"><div class=\"section-head\"><h2 id=\"services-heading\" class=\"section-title\">服务状态</h2><p id=\"updated\" class=\"updated\" role=\"status\">等待检测</p></div><ul id=\"cards\" class=\"cards\" aria-label=\"四个平台检测结果\"></ul></section>\n<p class=\"note\"><svg aria-hidden=\"true\"><use href=\"#alert\"/></svg><span id=\"note\">示例数据，仅用于展示界面。</span></p>\n</main>\n<script>\n(function(){\n'use strict';\nvar preview=document.documentElement.dataset.mode!=='live';\nvar platforms=[\n {id:'netflix',title:'Netflix',tag:'影视串流'},\n {id:'disney',title:'Disney+',tag:'影视串流'},\n {id:'youtube',title:'YouTube Premium',tag:'视频服务'},\n {id:'gpt',title:'ChatGPT',tag:'AI 对话'}\n];\nvar tone={reachable:'check',blocked:'closed',error:'closed',warn:'alert',timeout:'alert',pending:'dash',idle:'dash'};\nvar sample={route:'现有分流',at:Date.now()-2130,duration:2130,rows:[\n {id:'netflix',state:'reachable',label:'网页可达',region:'JP',ms:680},\n {id:'disney',state:'reachable',label:'网页可达',region:'SG',ms:1230},\n {id:'youtube',state:'reachable',label:'网页可达',region:'US',ms:510},\n {id:'gpt',state:'warn',label:'需人机验证',region:'',ms:2130}\n]};\nfunction id(x){return document.getElementById(x)}\nvar cards=id('cards'),button=id('scan'),views=[];\nplatforms.forEach(function(p){\n var n=document.createElement('li');n.className='card';n.innerHTML='<div class=\"card-top\"><div class=\"service-icon '+p.id+'\"><svg><use href=\"#'+p.id+'\"/></svg></div><span class=\"service-tag\">'+p.tag+'</span></div><div><div class=\"service-name\"></div><div class=\"service-hint\"></div></div><div class=\"card-bottom\"><span class=\"badge\" data-state=\"idle\"><svg><use href=\"#dash\"/></svg><span class=\"badge-label\"></span></span><span class=\"latency\"></span></div>';\n n.querySelector('.service-name').textContent=p.title;n.querySelector('.service-hint').textContent='';cards.appendChild(n);\n views.push({p:p,node:n,name:n.querySelector('.service-name'),hint:n.querySelector('.service-hint'),badge:n.querySelector('.badge'),use:n.querySelector('.badge use'),label:n.querySelector('.badge-label'),latency:n.querySelector('.latency')});\n});\nfunction time(ms){if(typeof ms!=='number'||!isFinite(ms)||ms<0)return '';return ms<1000?Math.round(ms)+' ms':(ms/1000).toFixed(1)+' s'}\nfunction clock(ms){var d=new Date(ms);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}\nfunction paint(data,busy){var count=0;views.forEach(function(v){var r=data&&data.rows.find(function(x){return x&&x.id===v.p.id}),state=r&&tone[r.state]?r.state:(busy?'pending':'idle');if(state==='reachable')count++;v.node.setAttribute('aria-busy',busy?'true':'false');v.badge.dataset.state=state;v.use.setAttribute('href','#'+tone[state]);v.label.textContent=r?String(r.label||'无法判断').slice(0,14):(busy?'检测中':'待检测');v.hint.textContent=r&&/^[A-Z]{2}$/.test(r.region||'')?('地区提示 '+r.region):v.p.tag;v.latency.textContent=r?time(r.ms):''});\n id('count').textContent=data?count:'—';id('progress').style.width=data?(count*25)+'%':'0%';id('summary').textContent=busy?'正在检测四个平台':!data?'四个平台，一眼看清':count===4?'四个服务网页均可访问':(4-count)+' 个服务未确认可达';id('route-name').textContent=data&&data.route?String(data.route).slice(0,42):'现有分流';id('updated').textContent=busy?'正在检测':!data?'等待检测':(preview?'示例数据':clock(data.at)+' 更新')+' · '+time(data.duration);id('scan-label').textContent=busy?'检测中…':preview?'演示刷新':data?'重新检测':'立即检测'}\nid('mode').textContent=preview?'设计预览':'Surge 本地';id('note').textContent=preview?'示例数据，仅用于展示界面。':'仅探测公开网页，不验证播放、登录或对话。';var previous=preview?sample:null;paint(previous,false);\nbutton.addEventListener('click',async function(){if(button.disabled)return;button.disabled=true;id('message').hidden=true;paint(null,true);var timer=null;try{if(preview){await new Promise(function(resolve){setTimeout(resolve,650)});previous=sample}else{var ctl=new AbortController();timer=setTimeout(function(){ctl.abort()},16000);var res=await fetch('./probe',{method:'GET',headers:{'X-Signal-Request':'scan'},credentials:'omit',cache:'no-store',signal:ctl.signal});if(!res.ok||!(res.headers.get('content-type')||'').includes('application/json'))throw Error('probe');var d=await res.json();if(!d||d.v!==2||!Array.isArray(d.rows)||d.rows.length!==4||!isFinite(d.at))throw Error('payload');previous=d}paint(previous,false)}catch(e){paint(previous,false);id('message').textContent='本次检测未完成，请确认 Surge 正在运行且 Signal 模块已启用。';id('message').hidden=false}finally{clearTimeout(timer);button.disabled=false}})\n})();\n</script>\n</body>\n</html>\n");return;}
    var hs=req.headers||{};
    var hn=Object.keys(hs).filter(function(k){return k.toLowerCase()==='x-signal-request';})[0];
    if(!hn||hs[hn]!=='scan'){localReply(403,'text/plain','Open the Signal dashboard to start a scan.');return;}
  }
  var started = Date.now(), finished = false;
  var services = [
    {id: 'netflix', name: 'Netflix', url: 'https://www.netflix.com/', domain: /netflix/i},
    {id: 'disney', name: 'Disney+', url: 'https://www.disneyplus.com/', domain: /disney/i},
    {id: 'youtube', name: 'YouTube Premium', url: 'https://www.youtube.com/premium', domain: /youtube|ytInitialData|ytcfg/i},
    {id: 'gpt', name: 'ChatGPT', url: 'https://chatgpt.com/', domain: /ChatGPT|chatgpt\.com|__NEXT_DATA__|OpenAI/i}
  ];
  var policy = '';
  try {
    var arg = typeof $argument === 'string' ? $argument : '';
    var pm = arg.match(/(?:^|&)policy=([^&]*)/);
    if (pm) policy = decodeURIComponent(pm[1]);
  } catch (_) {}
  var rows = services.map(function (s) {
    return {id: s.id, state: 'pending', label: '检测中', region: '', ms: null};
  });
  function code(value) {
    value = String(value || '').toUpperCase();
    return /^[A-Z]{2}$/.test(value) ? value : '';
  }
  function regionHint(i, body, headers) {
    var m;
    if (i === 0) {
      m = body.match(/"(?:countryOfRequest|currentCountry|requestCountry)"\s*:\s*"([A-Za-z]{2})"/);
      if (!m && headers['x-originating-url']) {
        m = String(headers['x-originating-url']).match(/^https:\/\/(?:www\.)?netflix\.com\/([A-Za-z]{2})(?:-[A-Za-z]{2})?\//i);
      }
    } else if (i === 1) {
      m = body.match(/"(?:countryCode|country_code)"\s*:\s*"([A-Za-z]{2})"/) || body.match(/Region:\s*([A-Za-z]{2})\b/);
    } else if (i === 2) {
      m = body.match(/"(?:countryCode|GL)"\s*:\s*"([A-Za-z]{2})"/);
    }
    // ChatGPT HTML is not a reliable source of the user's egress country.
    return code(m && m[1]);
  }
  function classify(i, status, body, headers) {
    var region = regionHint(i, body, headers);
    if (status === 429) return {state: 'warn', label: '请求过于频繁', region: region};
    if (i === 3 && /"code"\s*:\s*"unsupported_country(?:_region_territory)?"|(?:OpenAI(?:'s)? services|ChatGPT) (?:are |is )?not (?:available|supported) in your (?:country|region)|unsupported country,? region,? (?:or|and) territory/i.test(body)) {
      return {state: 'blocked', label: '地区不支持', region: ''};
    }
    if (/^challenge$/i.test(String(headers['cf-mitigated'] || '')) || /verify (?:that )?you are human|unusual traffic|cf-chl-|challenge-platform|before you continue to youtube|<title[^>]*>\s*Just a moment|<(?:form|div)[^>]+id=["'](?:captcha|challenge-stage|challenge-running)/i.test(body)) {
      return {state: 'warn', label: '验证页 · 无法判断', region: ''};
    }
    if (status >= 200 && status < 300 && (
      /(?:Sorry,?\s*)?Disney\+ is not available in your (?:region|location|country)/i.test(body) ||
      /Premium is not available in your country/i.test(body) ||
      /Netflix (?:is not|isn't) available in your country/i.test(body)
    )) return {state: 'blocked', label: '提示地区不支持', region: region};
    if (status === 401 || status === 403 || status === 451) {
      return {state: 'warn', label: 'HTTP ' + status + ' · 访问受限', region: region};
    }
    if (status < 200 || status >= 300) {
      return {state: 'warn', label: 'HTTP ' + status + ' · 未能判断', region: region};
    }
    if (!services[i].domain.test(body) || body.length < 100) {
      return {state: 'warn', label: '页面异常 · 未能判断', region: ''};
    }
    return {state: 'reachable', label: '页面可达', region: region};
  }
  function request(i) {
    return new Promise(function (resolve) {
      var settled = false, begin = Date.now();
      function settle(result) {
        if (settled) return;
        settled = true;
        if (!finished) {
          result.id = services[i].id;
          result.ms = Math.max(0, Date.now() - begin);
          rows[i] = result;
        }
        resolve();
      }
      setTimeout(function () { settle({state: 'timeout', label: '检测超时', region: ''}); }, 9000);
      var options = {
        url: services[i].url,
        timeout: 8,
        'auto-cookie': false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml'
        }
      };
      if (policy) options.policy = policy;
      try {
        $httpClient.get(options, function (error, response, data) {
          if (settled || finished) return;
          try {
            if (error) {
              settle({state: /timed?\s*out|timeout/i.test(String(error)) ? 'timeout' : 'error', label: /timed?\s*out|timeout/i.test(String(error)) ? '检测超时' : '网络异常', region: ''});
              return;
            }
            var headers = {};
            Object.keys((response && response.headers) || {}).forEach(function (k) {headers[k.toLowerCase()] = response.headers[k];});
            settle(classify(i, Number(response && (response.status || response.statusCode)) || 0, String(data || '').slice(0, 3000000), headers));
          } catch (_) { settle({state: 'warn', label: '解析异常 · 未能判断', region: ''}); }
        });
      } catch (_) { settle({state: 'error', label: '请求未能发出', region: ''}); }
    });
  }
  var shortLabels={'请求过于频繁':'请求限流','验证页 · 无法判断':'需验证','提示地区不支持':'地区受限','解析异常 · 未能判断':'无法判断','页面异常 · 未能判断':'页面异常','请求未能发出':'请求失败','页面可达':'网页可达'};
  function finish(){
    if(finished)return;
    finished=true;
    var at=Date.now();
    var route=policy?policy.replace(/[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g,' ').trim().slice(0,42):'现有分流';
    var count=0;
    var data=rows.map(function(r){
      if(r.state==='reachable')count++;
      var label=r.state==='pending'?'检测超时':(shortLabels[r.label]||r.label);
      label=label.replace(' · 访问受限',' 受限').replace(' · 未能判断','');
      return {id:r.id,state:r.state==='pending'?'timeout':r.state,label:label,region:r.region,ms:r.ms};
    });
    if(req){localReply(200,'application/json',JSON.stringify({v:2,route:route,at:at,duration:Math.max(0,at-started),rows:data}));return;}
    var names=['Netflix','Disney+','YouTube','ChatGPT'];
    var hm=new Date(at),clock=('0'+hm.getHours()).slice(-2)+':'+('0'+hm.getMinutes()).slice(-2);
    var lines=[count+'/4 网页可达  ·  '+clock,''];
    data.forEach(function(r,i){lines.push(names[i]+'  /  '+r.label+(r.region?' · '+r.region:''));});
    lines.push('','仅网页探测 · 地区为页面提示');
    $done({title:'Signal · 连通性',content:lines.join('\n'),icon:'waveform', 'icon-color':'#408C7B'});
  }
  setTimeout(finish,11000);
  Promise.all(services.map(function(_,i){return request(i);})).then(finish,finish);
})();
