import { sessaoObrigatoria } from '../../../services/conexao.js';
import { jogos as games } from './catalogo.js';
import { acompanharAcessoJogos } from '../../../services/jogos-acesso.js';
import { initSpaceEffects } from './galaxia-efeitos.js';
import { initUniverse } from './universo.js';

const session = sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);
let blocked = true;
let origin = null;
function aplicarAcesso(estado) {
 blocked=!estado.liberado;
 document.body.classList.toggle('is-blocked',blocked);
 $('blockedState').hidden=!blocked;
 if($('entryContent'))$('entryContent').hidden=blocked;
 if($('universeObjects')){$('universeObjects').inert=blocked;document.querySelector('.universe-bottom').hidden=blocked;if(blocked)$('destinationPanel').hidden=true;}
 document.querySelectorAll('dialog[open]').forEach(dialog=>{if(blocked)dialog.close();});
 $('accessState').textContent=estado.mensagem;
 $('blockedTitle').textContent=estado.erro?'Não foi possível consultar o acesso':'Hora de focar nas atividades';
 $('blockedDescription').textContent=estado.mensagem;
}
$('retryAccess')?.addEventListener('click',()=>document.dispatchEvent(new Event('astrolearn:refresh-games-access')));
acompanharAcessoJogos(aplicarAcesso);

function openDialog(dialog) {
  origin = document.activeElement;
  dialog.showModal();
}
function restoreFocus() {
  const target = origin?.isConnected && origin.getClientRects().length
    ? origin : $('exploreGames') || $('openDestinations');
  target?.focus();
}
function closeDialog(dialog) { dialog.close(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', restoreFocus);
  dialog.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => closeDialog(dialog));
  });
});
function showGame(id) {
  if (blocked || !games[id]) return;
  const game = games[id];
  $('gameTitle').textContent = game.title;
  $('gameCategory').textContent = game.category;
  $('gameDescription').textContent = game.description;
  $('gameMode').textContent = game.mode;
  $('launchGame').href = game.url;
  $('dialogArt').firstElementChild.className = 'sprite ' + game.art;
  $('gameInstructions').replaceChildren();
  game.instructions.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    $('gameInstructions').append(li);
  });
  openDialog($('gameDialog'));
}
let selectedGame = null;
function selectGame(id) {
  if (blocked || !games[id]) return;
  selectedGame = id;
  const game = games[id];
  if ($('destinationsDialog')?.open) { origin = $('showInstructions'); $('destinationsDialog').close(); }
  if (!$('destinationPanel')) { showGame(id); return; }
  $('selectedTitle').textContent = game.title;
  $('selectedDescription').textContent = game.description;
  $('startSelected').href = game.url;
  $('selectedProgress').textContent = game.year + ' · ' + game.mode;
  $('destinationPanel').hidden = false;
  document.querySelectorAll('.planet-target').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.game === id)));
  document.dispatchEvent(new CustomEvent('astrolearn:universe-focus', { detail: { id } }));
  $('universeStatus').textContent = game.title + ' selecionado. Use Como jogar ou Iniciar missão.';
  $('showInstructions').focus({ preventScroll: true });
}
document.querySelectorAll('[data-game]').forEach(button => {
  button.addEventListener('click', event => {
    if (document.body.classList.contains('universe-dragged')) { event.preventDefault(); return; }
    selectGame(button.dataset.game);
  });
});
$('showInstructions')?.addEventListener('click', () => showGame(selectedGame));
$('closeDestination')?.addEventListener('click', () => {
  $('destinationPanel').hidden = true;
  document.getElementById('planet-' + selectedGame)?.focus({ preventScroll: true });
});
$('openDestinations')?.addEventListener('click', () => openDialog($('destinationsDialog')));
initSpaceEffects();
if ($('universeViewport')) initUniverse();
