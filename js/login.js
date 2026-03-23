(function () {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function (user) {
      if (user) {
        sessionStorage.setItem('pcscp_admin_gate', 'passed');
        const status = document.querySelector('[data-login-status]');
        if (status) status.textContent = 'You are already signed in. Redirecting to the dashboard...';
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
      if (window.ADMIN_EMAIL && window.netlifyIdentity) {
        await window.netlifyIdentity.login(window.ADMIN_EMAIL, password);
        window.location.href = '/admin/';
        return;
      }

      window.location.href = '/admin/';
    } catch (error) {
      console.error(error);
      setStatus('前台口令已通过，但 Netlify Identity 登录未完成。请确认 admin/admin-auth.js 中已填写管理员邮箱，并在 Netlify Identity 中把该邮箱的密码设置为 bingxiangtie2026。');
    } finally {
      button.disabled = false;
    }
  });
})();
