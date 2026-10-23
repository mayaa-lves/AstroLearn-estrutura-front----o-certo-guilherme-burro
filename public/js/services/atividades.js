import { api, id } from './conexao.js';
import { CONFIG } from '../config.js';

export const EXTENSOES = ['pdf', 'docx', 'pptx', 'xlsx', 'zip', 'png', 'jpg', 'jpeg', 'txt', 'py', 'ipynb'];
export const ACCEPT_ARQUIVOS = EXTENSOES.map(ext => '.' + ext).join(',');
export const LIMITE_ARQUIVO = 20 * 1024 * 1024;
// Reserva margem para campos e cabeçalhos no limite de 4,5 MB da Vercel.
export const LIMITE_ENVIO = new URL(CONFIG.apiBaseUrl).hostname.endsWith('.vercel.app')
  ? 4_000_000 : 60 * 1024 * 1024;
export const AVISO_UPLOAD = LIMITE_ENVIO === 4_000_000
  ? 'Até 4 MB no total por envio nesta hospedagem.' : 'Até 20 MB por arquivo.';

export function validarArquivos(arquivos, maximo = 3) {
  const lista = Array.from(arquivos || []);
  if (lista.length > maximo) throw new Error(`Selecione até ${maximo} arquivo${maximo === 1 ? '' : 's'}.`);
  const nomes = new Set();
  let total = 0;
  for (const arquivo of lista) {
    const extensao = arquivo.name.split('.').pop().toLowerCase();
    if (!arquivo.name.includes('.') || !EXTENSOES.includes(extensao)) throw new Error(`${arquivo.name}: formato não aceito. Use ${EXTENSOES.join(', ')}.`);
    if (!arquivo.size || arquivo.size > LIMITE_ARQUIVO) throw new Error(`${arquivo.name}: o arquivo deve ter conteúdo e no máximo 20 MB.`);
    const chave = arquivo.name + ':' + arquivo.size + ':' + arquivo.lastModified;
    if (nomes.has(chave)) throw new Error('O mesmo arquivo foi selecionado mais de uma vez.');
    nomes.add(chave); total += arquivo.size;
  }
  if (total > LIMITE_ENVIO) throw new Error(AVISO_UPLOAD + ' Reduza os arquivos antes de continuar.');
  return lista;
}
export function urlSegura(valor) {
  try {
    const url = new URL(valor);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function formatarPrazo(valor) {
  if (!valor) return 'Sem prazo definido';
  // Uma data sem horário representa o dia do calendário, não meia-noite UTC.
  const data = new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor + 'T12:00:00' : valor);
  return Number.isNaN(data.getTime()) ? 'Data não informada' : data.toLocaleDateString('pt-BR');
}
export function normalizarAnexo(anexo) {
  const nome = anexo.nome_arquivo || anexo.anexo_nome || anexo.name || 'Arquivo';
  const tipos = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
  return { ...anexo, name: nome, url: anexo.url || anexo.anexo_url, type: anexo.type || tipos[nome.split('.').pop().toLowerCase()] || 'application/octet-stream' };
}
export const consultarAtividade = valor => api('/api/aluno/missoes/' + id(valor));
export async function enviarEntrega(missaoId, texto, arquivos = []) {
  const lista = validarArquivos(arquivos);
  const resposta = String(texto || '').trim();
  if (!missaoId) throw new Error('Abra uma atividade pela trilha.');
  if (!resposta && !lista.length) throw new Error('Escreva uma resposta ou adicione pelo menos um arquivo.');
  if (resposta.length > 10000) throw new Error('Use até 10.000 caracteres na resposta.');
  if (!lista.length) return api('/api/aluno/missoes/enviar', 'POST', { missao_id: missaoId, texto: resposta });
  const dados = new FormData();
  dados.append('missao_id', missaoId); dados.append('texto', resposta);
  lista.forEach(arquivo => dados.append('anexos', arquivo, arquivo.name));
  return api('/api/aluno/missoes/enviar', 'POST', dados);
}
