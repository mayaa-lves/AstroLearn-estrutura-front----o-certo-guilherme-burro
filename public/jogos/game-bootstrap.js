import { obterSessao } from '../js/services/autenticacao.js';
import { consultarAcessoJogos, acompanharAcessoJogos } from '../js/services/jogos-acesso.js';
import { criarArmazenamento } from './game-storage.js';
const script=document.querySelector('script[data-astro-game]');
const session=obterSessao();
function aviso(text){document.body.replaceChildren();const p=document.createElement('p');p.textContent=text;p.style.cssText='font:16px/1.6 Arial,sans-serif;padding:24px;color:#332044;background:#fff';p.setAttribute('role','status');document.body.append(p);}
if(!session||session.usuario.role!=='aluno')location.replace(new URL('../../auth/login.html',import.meta.url));
else {
 const access=await consultarAcessoJogos();
 if(!access.liberado)aviso(access.mensagem);
 else {
  const game=script?.dataset.astroGame,entry=new URL(script?.dataset.entry||'',location.href);
  const folder=new URL('./',location.href);
  if(!['jogo6','jogo8','jogo9'].includes(game)||entry.origin!==location.origin||!entry.pathname.startsWith(folder.pathname))aviso('Não foi possível identificar o jogo. Volte ao universo.');
  else {
   window.ASTROLEARN_GAME_CONTEXT={nome:session.usuario.nome||'',storage:criarArmazenamento(session.usuario.id,game)};
   window.addEventListener('astrolearn:game-storage-unavailable',()=>{if(document.getElementById('storageNotice'))return;const p=document.createElement('p');p.id='storageNotice';p.textContent='O navegador não permitiu salvar o ranking. Ele ficará apenas nesta sessão.';p.setAttribute('role','status');p.style.cssText='position:fixed;bottom:8px;left:8px;z-index:9999;background:#fff3d1;color:#553811;padding:12px;border-radius:12px';document.body.append(p);});
   try{await import(entry.href);acompanharAcessoJogos(state=>{if(!state.liberado)location.replace(new URL('../../aluno/jogos/index.html',import.meta.url));});}catch{aviso('Não foi possível iniciar o jogo. Atualize a página.');}
  }
 }
}
