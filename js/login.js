(function () {
  const SITE = 'https://prague-czech-souvenir.netlify.app';

  // If already have valid token in localStorage, go straight to admin
  try {
    const stored = JSON.parse(localStorage.getItem('netlify-cms-user') || 'null');
    if (stored && stored.token && stored.token.access_token) {
      window.location.href = '/admin/';
      return;
    }
  } catch(e) {}

  const form = document.querySelector('[data-admin-login-form]');
  if (!form) return;
  const statusEl = document.querySelector('[data-login-status]');
  const button = form.querySelector('button[type="submit"]');

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || '';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = form.querySelector('[name="username"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    if (username !== 'prague' || password !== 'bingxiangtie2026') {
      setStatus('账号或密码错误。');
      return;
    }

    button.disabled = true;
    setStatus('正在登录...');

    try {
      // Step 1: get token from Identity API
      const res = await fetch(SITE + '/.netlify/identity/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=password'
          + '&username=' + encodeURIComponent(window.ADMIN_EMAIL || '')
          + '&password=' + encodeURIComponent(password)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus('登录失败：' + (err.error_description || err.msg || res.status));
        button.disabled = false;
        return;
      }

      const data = await res.json();

      // Step 2: get user info
      const userRes = await fetch(SITE + '/.netlify/identity/user', {
        headers: { 'Authorization': 'Bearer ' + data.access_token }
      });
      const userData = await userRes.json();

      // Step 3: store in the exact format Netlify CMS expects
      const cmsUser = {
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
      // Also set gotrue format for compatibility
      localStorage.setItem('gotrue.user', JSON.stringify(cmsUser));

      sessionStorage.setItem('pcscp_admin_gate', 'passed');
      setStatus('登录成功！正在进入后台...');

      setTimeout(function() {
        window.location.href = '/admin/';
      }, 300);

    } catch (err) {
      console.error(err);
      setStatus('登录出错，请稍后重试。');
      button.disabled = false;
    }
  });
})();
