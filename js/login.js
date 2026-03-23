(function () {
  var SITE = 'https://prague-czech-souvenir.netlify.app';
  var CRED_HASH = 'fc0d943058369b9fcb58afa214c4ab3f04a61a7554c7bb27c949232697c9badc';

  async function hashCred(u, p) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(u + ':' + p));
    return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  }

  try {
    var stored = JSON.parse(localStorage.getItem('netlify-cms-user') || 'null');
    if (stored && stored.token && stored.token.access_token) {
      window.location.href = '/admin/';
      return;
    }
  } catch(e) {}

  var form = document.querySelector('[data-admin-login-form]');
  if (!form) return;
  var statusEl = document.querySelector('[data-login-status]');
  var button = form.querySelector('button[type="submit"]');

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || '';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var username = form.querySelector('[name="username"]').value.trim();
    var password = form.querySelector('[name="password"]').value;

    var hash = await hashCred(username, password);
    if (hash !== CRED_HASH) {
      setStatus('账号或密码错误。');
      return;
    }

    button.disabled = true;
    setStatus('正在登录...');

    try {
      var res = await fetch(SITE + '/.netlify/identity/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=password&username=' + encodeURIComponent(window.ADMIN_EMAIL || '') + '&password=' + encodeURIComponent(password)
      });

      if (!res.ok) {
        var err = await res.json().catch(function(){return {};});
        setStatus('登录失败：' + (err.error_description || err.msg || res.status));
        button.disabled = false;
        return;
      }

      var data = await res.json();
      var userRes = await fetch(SITE + '/.netlify/identity/user', {
        headers: { 'Authorization': 'Bearer ' + data.access_token }
      });
      var userData = await userRes.json();

      var cmsUser = {
        email: userData.email,
        user_metadata: userData.user_metadata || {},
        app_metadata: userData.app_metadata || {},
        token: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: 'bearer',
          expires_in: data.expires_in,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        },
        id: userData.id,
        aud: userData.aud || '',
        role: userData.role || '',
        url: SITE + '/.netlify/identity'
      };

      localStorage.setItem('netlify-cms-user', JSON.stringify(cmsUser));
      localStorage.setItem('gotrue.user', JSON.stringify(cmsUser));
      setStatus('登录成功！正在进入后台...');
      setTimeout(function() { window.location.href = '/admin/'; }, 300);

    } catch (err) {
      console.error(err);
      setStatus('登录出错，请稍后重试。');
      button.disabled = false;
    }
  });
})();
