if (window.location.pathname.startsWith('/admin')) {
  const gatePassed = sessionStorage.getItem('pcscp_admin_gate') === 'passed';
  if (!gatePassed && window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function(user) {
      if (!user) {
        window.location.replace('/my.html');
      }
    });
  } else if (!gatePassed && !window.netlifyIdentity) {
    window.location.replace('/my.html');
  }
}
