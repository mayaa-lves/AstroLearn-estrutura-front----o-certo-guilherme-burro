import { sessaoObrigatoria } from '../../../services/conexao.js';
import { acompanharAcessoJogos } from '../../../services/jogos-acesso.js';
sessaoObrigatoria('aluno');
const gate=document.createElement('section');gate.setAttribute('role','alert');gate.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;align-content:center;justify-items:center;gap:20px;padding:30px;background:#17132bf5;color:#fff;font:18px/1.6 Arial,sans-serif';
const text=document.createElement('p');text.textContent='Consultando acesso aos jogos…';const link=document.createElement('a');link.textContent='Voltar para a trilha';link.href='../home.html#journey';link.style.color='#d3b5ff';gate.append(text,link);document.body.append(gate);
acompanharAcessoJogos(state=>{gate.hidden=state.liberado;gate.style.display=state.liberado?'none':'grid';text.textContent=state.mensagem;document.querySelector('main')?.toggleAttribute('inert',!state.liberado);});
