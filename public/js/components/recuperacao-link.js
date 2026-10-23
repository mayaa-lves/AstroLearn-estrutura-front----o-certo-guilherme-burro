// Executa no início da landing/login/recuperação. Não altera visitas normais.
(() => {
  const current = new URL(location.href);
  const hash = new URLSearchParams(current.hash.slice(1));
  const type = hash.get('type') || current.searchParams.get('type');
  const error = hash.get('error_code') || current.searchParams.get('error_code');
  if (type !== 'recovery' && !['otp_expired','otp_disabled'].includes(error)) return;
  const destination = new URL('../../../auth/redefinir-senha.html', document.currentScript.src);
  const safe = new URLSearchParams();
  for (const name of ['access_token','type','error','error_code']) {
    const value = hash.get(name) || current.searchParams.get(name);
    if (value) safe.set(name,value);
  }
  destination.hash = safe.toString();
  for (const name of ['access_token','refresh_token','expires_in','expires_at','token_type','type','error','error_code','error_description']) current.searchParams.delete(name);
  current.hash = '';
  history.replaceState(history.state,'',current.pathname + current.search);
  location.replace(destination.href);
})();
