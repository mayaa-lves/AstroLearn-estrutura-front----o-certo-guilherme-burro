import { api } from './conexao.js';
// Contrato proposto em PARA-O-YAN.txt. 404 significa recurso ainda não publicado;
// os jogos locais continuam disponíveis, sem simular autorização do professor.
export async function consultarAcessoJogos() {
 try {
  const data=await api('/api/aluno/jogos/acesso');
  if(typeof data?.liberado!=='boolean')throw new Error('O servidor retornou uma permissão inválida.');
  return {integrado:true,liberado:data.liberado,sala_id:data.sala_id,mensagem:data.liberado?'Jogos liberados pelo professor':(typeof data.motivo==='string'?data.motivo:'Seu professor pausou os jogos desta turma. Continue sua trilha de atividades.')};
 }catch(error){
  if(error.status===404)return {integrado:false,liberado:true,mensagem:'Controle por turma ainda não ativado no servidor.'};
  return {integrado:false,liberado:false,erro:true,mensagem:error.message||'Não foi possível consultar o acesso. Tente novamente.'};
 }
}
export function acompanharAcessoJogos(onChange) {
 let busy=false,disposed=false,last=0;
 const refresh=async()=>{
  if(busy||disposed)return;busy=true;
  const state=await consultarAcessoJogos();busy=false;last=Date.now();
  if(!disposed){onChange(state);document.dispatchEvent(new CustomEvent('astrolearn:games-access',{detail:state}));}
 };
 const visible=()=>{if(!document.hidden&&Date.now()-last>5000)refresh();};
 const timer=setInterval(()=>{if(!document.hidden)refresh();},30000);
 document.addEventListener('visibilitychange',visible);window.addEventListener('focus',visible);
 document.addEventListener('astrolearn:refresh-games-access',refresh);
 const shown=event=>{if(event.persisted)refresh();};
 const leave=event=>{if(!event.persisted)dispose();};
 const dispose=()=>{disposed=true;clearInterval(timer);document.removeEventListener('visibilitychange',visible);window.removeEventListener('focus',visible);document.removeEventListener('astrolearn:refresh-games-access',refresh);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',shown);};
 window.addEventListener('pagehide',leave);window.addEventListener('pageshow',shown);refresh();return dispose;
}
