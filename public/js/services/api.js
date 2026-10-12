import { CONFIG } from '../config.js';

// Base adiantada. Nenhuma página faz chamadas até implementarmos seu fluxo.
// O token será fornecido pelo módulo de autenticação, quando ele for construído.
export async function solicitar(caminho, { metodo = 'GET', dados, token, sinal } = {}) {
  if (!caminho.startsWith('/api/')) throw new Error('Use um caminho iniciado por /api/.');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const arquivo = dados instanceof FormData;
  if (dados !== undefined && !arquivo) headers['Content-Type'] = 'application/json';
  const resposta = await fetch(CONFIG.apiBaseUrl.replace(/\/$/, '') + caminho, {
    method: metodo, headers, signal: sinal,
    body: dados === undefined ? undefined : arquivo ? dados : JSON.stringify(dados),
  });
  let resultado;
  try { resultado = await resposta.json(); }
  catch { throw new Error('O servidor não retornou uma resposta válida.'); }
  if (!resposta.ok || resultado.success !== true) {
    throw new Error(resultado.error || 'Não foi possível concluir a operação.');
  }
  return resultado.data;
}
