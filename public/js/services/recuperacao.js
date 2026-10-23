import { solicitar } from './api.js';

export const solicitarRecuperacao = email => solicitar('/api/auth/esqueci-senha', {
  metodo: 'POST', dados: {email: email.trim().toLowerCase()}
});
export const salvarNovaSenha = (senha, token) => solicitar('/api/auth/redefinir-senha', {
  metodo: 'POST', dados: {senha}, token
});

export const requisitosSenha = [
  ['length', '8 a 128 caracteres', senha => senha.length >= 8 && senha.length <= 128],
  ['upper', 'Uma letra maiúscula', senha => /[A-Z]/.test(senha)],
  ['lower', 'Uma letra minúscula', senha => /[a-z]/.test(senha)],
  ['number', 'Um número', senha => /[0-9]/.test(senha)],
  ['symbol', 'Um símbolo', senha => /[^A-Za-z0-9]/.test(senha)]
];

// A leitura do JWT orienta a tela; o backend valida autenticidade e autorização.
// O token fica somente na memória desta página, nunca no armazenamento do site.
export function capturarRecuperacao(href = location.href) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const get = name => hash.get(name) || url.searchParams.get(name);
  const tipo = get('type');
  const token = get('access_token');
  const erro = get('error') || get('error_code');
  for (const name of ['access_token','refresh_token','expires_in','expires_at','token_type','type','error','error_code','error_description','code','token_hash']) url.searchParams.delete(name);
  url.hash = '';
  history.replaceState(history.state, '', url.pathname + url.search);
  if (erro) throw Error('Este link não é válido ou já expirou. Solicite um novo e-mail de recuperação.');
  if (tipo && tipo !== 'recovery') throw Error('Este link não é de recuperação de senha. Solicite um novo link abaixo.');
  if (!token || token.length > 16384) throw Error('Abra esta página pelo link de recuperação recebido no seu e-mail.');
  try {
    const partes = token.split('.');
    if (partes.length !== 3) throw Error();
    const base = partes[1].replace(/-/g,'+').replace(/_/g,'/');
    const payload = JSON.parse(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')));
    if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) throw Error();
    return {token, expiresAt: payload.exp * 1000};
  } catch {
    throw Error('Seu link está inválido ou expirou. Solicite outro para continuar.');
  }
}
