import { api } from './conexao.js';
import { obterSessao } from './autenticacao.js';
// Prévia explícita, temporária e limitada à conta de aluno nesta aba.
// Não altera a configuração da turma nem autoriza ações no servidor.
const DEMO_KEY = 'astrolearn-jogos-demo-yan-v1';
let demoBanner = null;
function demonstracaoAtiva() {
 const session = obterSessao();
 if (!session || session.usuario.role !== 'aluno' || !/\/aluno\/jogos\//.test(location.pathname)) return false;
 try {
  const url = new URL(location.href);
  if (url.searchParams.get('demo') === 'yan') {
   sessionStorage.setItem(DEMO_KEY,JSON.stringify({aluno_id:session.usuario.id,expira_em:Date.now()+60*60*1000}));
   url.searchParams.delete('demo');history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }
  const saved = JSON.parse(sessionStorage.getItem(DEMO_KEY) || 'null');
  if (saved?.aluno_id === session.usuario.id && Number(saved.expira_em)>Date.now()) return true;
  if (saved) sessionStorage.removeItem(DEMO_KEY);
 } catch { /* Sem armazenamento disponível, vale a consulta normal. */ }
 return false;
}
function mostrarDemonstracao(active) {
 if (!active) {demoBanner?.remove();demoBanner=null;return;}
 if (demoBanner?.isConnected) return;
 demoBanner = document.createElement('aside');
 demoBanner.setAttribute('aria-label','Demonstração dos jogos');
 demoBanner.dataset.gamesDemo='yan';
 demoBanner.style.cssText='position:fixed;z-index:9999;top:10px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:calc(100vw - 24px);box-sizing:border-box;padding:9px 13px;border:1px solid #d2bde4;border-radius:14px;background:#fff8f0;color:#39284f;box-shadow:0 5px 20px #30154122;font:12px/1.4 Arial,sans-serif';
 const text=document.createElement('span');text.textContent='Demonstração para Yan · jogos liberados nesta aba';
 const stop=document.createElement('button');stop.type='button';stop.textContent='Encerrar';stop.setAttribute('aria-label','Encerrar demonstração dos jogos');
 stop.style.cssText='border:1px solid #b39acb;border-radius:9px;background:white;color:#4c2d6f;padding:7px 10px;cursor:pointer;font:inherit';
 stop.onclick=()=>{try{sessionStorage.removeItem(DEMO_KEY);}catch{}mostrarDemonstracao(false);document.dispatchEvent(new Event('astrolearn:refresh-games-access'));};
 demoBanner.append(text,stop);document.body.append(demoBanner);
}

// Contrato proposto em PARA-O-YAN.txt. 404 significa recurso ainda não publicado;
// os jogos locais continuam disponíveis, sem simular autorização do professor.
export async function consultarAcessoJogos() {
 const demo=demonstracaoAtiva();mostrarDemonstracao(demo);
 if(demo)return {integrado:false,liberado:true,demonstracao:true,mensagem:'Demonstração para Yan: acesso liberado somente nesta aba por até uma hora. A permissão real da turma não foi alterada.'};
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
