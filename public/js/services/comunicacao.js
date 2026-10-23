import {api} from './conexao.js';
const part = encodeURIComponent;
export async function notificacoes() {
  try { return await api('/api/notificacoes'); }
  catch(error) {if(error.status===404) error.message='Os avisos dependem da publicação do complemento de comunicação no servidor.'; throw error;}
}
export const lerNotificacoes = ids => api('/api/notificacoes/lidas','PUT',{ids});
export const perguntasAluno = missao => api('/api/aluno/missoes/'+part(missao)+'/perguntas');
export const perguntarProfessor = (missao,texto) => api('/api/aluno/missoes/'+part(missao)+'/perguntas','POST',{texto});
