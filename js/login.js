(function () {
  // Auto-redirect if already logged in via Netlify Identity
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function (user) {
      if (user) {
        sessionStorage.setItem('pcscp_admin_gate', 'passed');
        window.location.href = '/admin/';
      }
    });
  }

  const form = document.querySelector('[data-admin-login-form]');
  if (!form) return;
  const status = document.querySelector('[data-login-status]');
  const button = form.querySelector('button[type="submit"]');

  function setStatus(message) {
    if (status) status.textContent = message || '';
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const username = form.querySelector('[name="username"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    if (username !== 'prague' || password !== 'bingxiangtie2026') {
      setStatus('账号或密码错误。');
      return;
    }

    button.disabled = true;
    setStatus('正在进入后台...');
    sessionStorage.setItem('pcscp_admin_gate', 'passed');

    try {
      // Use Identity API directly instead of widget popup
      const siteUrl = window.location.origin;
      const res = await fetch(siteUrl + '/.netlify/identity/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=password&username=' + encodeURIComponent(window.ADMIN_EMAIL || '') + '&password=' + encodeURIComponent(password)
      });
      if (res.ok) {
        const data = await res.json();
        // Store token for CMS use
        localStorage.setItem('gotrue.user', JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in
        }));
        window.location.href = '/admin/';
        return;
      } else {
        const err = await res.json();
        setStatus('Identity 登录失败：' + (err.error_description || err.msg || res.status));
      }
    } catch (error) {
      console.error(error);
      setStatus('登录出错，请稍后重试。');
    } finally {
      button.disabled = false;
    }
  });
})();
