// 会员深度解读：内容加密存放在 paid.enc.json，输入会员码后在浏览器里解密。
// 用法：NiumoPaid.mount(容器, 'BFIH')
(function () {
  var SRC = new URL('paid.enc.json', document.currentScript.src).href;
  var CONTACT = 'https://me.tonywu.top/';
  var STORE = 'niumo_member_code';
  var content = null, pending = null, mounts = [];

  var css = document.createElement('style');
  css.textContent = [
    '.paid { background: var(--surface, #fff); border: 1px solid var(--line, #e2eaf3); border-radius: 24px; padding: 20px 22px; margin-top: 18px; box-shadow: 0 10px 30px rgba(38, 80, 120, 0.05); text-align: left; }',
    '.type .paid { background: var(--tint, #eaf4fd); border: 0; box-shadow: none; border-radius: 20px; padding: 16px 18px; }',
    '.type .paid-form input { background: #fff; }',
    '.paid-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
    '.paid-head b { font-family: var(--display); font-weight: 900; font-size: 20px; color: var(--ink, #26313d); }',
    '.paid-tag { font-family: var(--display); font-weight: 700; font-size: 12px; color: #8a6400; background: #fff3c4; border-radius: 999px; padding: 2px 10px; }',
    '.paid-sum { color: var(--muted, #667382); font-size: 15px; margin: 8px 0 14px; }',
    '.paid-form { display: flex; gap: 8px; flex-wrap: wrap; }',
    '.paid-form input { flex: 1 1 140px; min-width: 0; font: 700 16px ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .06em; text-transform: uppercase; color: var(--ink, #26313d); background: var(--bg, #f5f9fd); border: 2px solid var(--line, #e2eaf3); border-radius: 14px; padding: 10px 14px; outline: none; }',
    '.paid-form input:focus { border-color: var(--blue, #4a9be0); }',
    '.paid-form button { font-family: var(--display); font-weight: 900; font-size: 16px; color: #fff; background: var(--blue, #4a9be0); border: 0; border-radius: 999px; padding: 10px 22px; cursor: pointer; }',
    '.paid-form button:disabled { opacity: .6; cursor: default; }',
    '.paid-msg { font-size: 14px; margin: 8px 0 0; min-height: 1.4em; color: var(--coral, #ff7468); }',
    '.paid-msg:empty { display: none; }',
    '.paid-buy { font-size: 14px; color: var(--muted, #667382); margin: 10px 0 0; }',
    '.paid h4 { font-family: var(--display); font-weight: 900; font-size: 16px; margin: 16px 0 6px; color: var(--blue-d, #2f7fc4); }',
    '.paid p.pp { margin: 0; font-size: 16px; }',
    '.paid ul { margin: 0; padding-left: 1.2em; }',
    '.paid li { margin-bottom: 4px; font-size: 16px; }'
  ].join('\n');
  document.head.appendChild(css);

  var SECTIONS = [
    ['why', '为什么你会是这一型'],
    ['signs', '膜快破了的信号'],
    ['fix', '怎么修膜'],
    ['env', '适合和要小心的工作环境'],
    ['pair', '和其他牛怎么相处']
  ];

  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function norm(s) { return s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, ''); }

  function unlock(code) {
    var c = norm(code || '');
    if (c.length !== 12) return Promise.reject(new Error('format'));
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('nocrypto'));
    var file;
    return fetch(SRC).then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
      .then(function (f) {
        file = f;
        return subtle.importKey('raw', new TextEncoder().encode(c), 'PBKDF2', false, ['deriveKey']);
      })
      .then(function (base) {
        return subtle.deriveKey({ name: 'PBKDF2', salt: b64(file.salt), iterations: file.it, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (kek) {
        // 依次试每个会员码对应的钥匙，能解开的就是对的
        var i = 0;
        function next() {
          if (i >= file.keys.length) throw new Error('wrong');
          var k = file.keys[i++];
          return subtle.decrypt({ name: 'AES-GCM', iv: b64(k.iv) }, kek, b64(k.k)).catch(next);
        }
        return next();
      })
      .then(function (raw) { return subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']); })
      .then(function (key) { return subtle.decrypt({ name: 'AES-GCM', iv: b64(file.iv) }, key, b64(file.data)); })
      .then(function (buf) {
        content = JSON.parse(new TextDecoder().decode(buf));
        try { localStorage.setItem(STORE, c); } catch (e) {}
        mounts.forEach(function (m) { render(m.el, m.type); });
        return content;
      });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render(box, type) {
    box.innerHTML = '';
    box.className = 'paid';
    var head = el('div', 'paid-head');
    head.appendChild(el('b', '', '会员深度解读'));
    head.appendChild(el('span', 'paid-tag', content ? '已解锁' : '会员'));
    box.appendChild(head);

    if (content && content[type]) {
      var t = content[type];
      SECTIONS.forEach(function (s) {
        var v = t[s[0]];
        if (!v) return;
        box.appendChild(el('h4', '', s[1]));
        if (Array.isArray(v)) {
          var ul = el('ul');
          v.forEach(function (x) { ul.appendChild(el('li', '', x)); });
          box.appendChild(ul);
        } else {
          box.appendChild(el('p', 'pp', v));
        }
      });
      return;
    }

    box.appendChild(el('p', 'paid-sum', '包括：为什么你会是这一型、膜快破了的信号、具体怎么修膜、适合和要小心的工作环境、和其他牛怎么相处。一个会员码可以解锁全部 16 种人格，长期有效。'));
    var form = el('form', 'paid-form');
    var input = el('input');
    input.placeholder = '输入会员码';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', '会员码');
    var btn = el('button', '', '解锁');
    btn.type = 'submit';
    form.appendChild(input);
    form.appendChild(btn);
    box.appendChild(form);
    var msg = el('p', 'paid-msg');
    box.appendChild(msg);
    var buy = el('p', 'paid-buy', '没有会员码？');
    var a = el('a', '', '联系作者获取');
    a.href = CONTACT;
    buy.appendChild(a);
    box.appendChild(buy);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btn.disabled = true;
      msg.textContent = '';
      btn.textContent = '解锁中…';
      unlock(input.value).catch(function (err) {
        btn.disabled = false;
        btn.textContent = '解锁';
        msg.textContent =
          err.message === 'format' ? '会员码是 12 位字母和数字，格式像 ABCD-EFGH-JKMN。' :
          err.message === 'wrong' ? '会员码不对，检查一下有没有输错。' :
          err.message === 'nocrypto' ? '当前浏览器不支持解锁，换个浏览器试试。' :
          '加载失败，刷新页面再试一次。';
      });
    });
  }

  function mount(box, type) {
    var found = false;
    mounts.forEach(function (m) { if (m.el === box) { m.type = type; found = true; } });
    if (!found) mounts.push({ el: box, type: type });
    render(box, type);
    if (!content && !pending) {
      var saved = null;
      try { saved = localStorage.getItem(STORE); } catch (e) {}
      if (saved) {
        pending = unlock(saved).catch(function () {
          try { localStorage.removeItem(STORE); } catch (e) {}
        });
      }
    }
  }

  window.NiumoPaid = { mount: mount };
})();
