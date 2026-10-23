import { jogos } from './catalogo.js';
import { montarJogo } from './frame-jogo.js';
const id=new URLSearchParams(location.search).get('jogo'),game=jogos[id];
const status=document.getElementById('gameStatus');
if(!game||id==='biolab'){
 document.getElementById('gameTitle').textContent='Jogo não encontrado';status.textContent='Volte ao universo e escolha um dos destinos disponíveis.';document.getElementById('fullscreen').hidden=true;
}else{
 document.title=game.title+' · AstroLearn';document.getElementById('gameTitle').textContent=game.title;
 document.getElementById('gameDescription').textContent=game.year+' · '+game.description+' Resultados locais; não alteram nota ou XP da plataforma.';
 const list=document.getElementById('gameInstructions');for(const text of game.instructions){const li=document.createElement('li');li.textContent=text;list.append(li);}
 const frame=document.getElementById('gameFrame');frame.title=game.title+' — '+game.year;
 montarJogo({frame,status,src:new URL('../../../../jogos/'+game.folder+'/index.html',import.meta.url).href});
}
