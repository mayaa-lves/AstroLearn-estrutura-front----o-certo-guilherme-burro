import { sessaoObrigatoria } from '../../../services/conexao.js';
import { readProgress } from '../../../components/jogos.js';
import { initSpaceEffects } from './galaxia-efeitos.js';
import { initUniverse } from './universo.js';

const session = sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);
const key = 'astrolearn-jogos-preview-v1:' + encodeURIComponent(session.usuario.id);
let blocked = false;
let origin = null;
try { blocked = sessionStorage.getItem(key) === 'bloqueado'; } catch { /* Prévia em memória. */ }

const games = {
  robo: {
    title: 'Rota do robô', category: 'ROBÓTICA · LÓGICA E SEQUÊNCIAS', art: 'rover',
    description: 'Programe seu explorador para chegar à base sem esbarrar nas rochas.',
    mode: '3 desafios individuais', url: 'robo-rota.html',
    instructions: ['Observe a posição do robô, das rochas e da base.', 'Adicione os comandos pelas setas. No tabuleiro, você também pode usar as setas do teclado.', 'Clique em Executar rota. Use Desfazer, Limpar ou a dica para revisar o caminho.']
  },
  quiz: {
    title: 'Quiz orbital', category: 'UNIVERSO · CIÊNCIA E CURIOSIDADE', art: 'earth',
    description: 'Investigue planetas e o movimento dos astros. Cada resposta vem com uma explicação.',
    mode: '6 perguntas individuais', url: 'quiz-orbital.html',
    instructions: ['Clique em Começar investigação na próxima tela.', 'Leia a pergunta, escolha uma alternativa e confirme.', 'Confira a explicação antes de avançar. Ao terminar, revise suas respostas e tente novamente se quiser.']
  },
  crew: {
    title: 'Cosmo Crew', category: 'COOPERAÇÃO · INVESTIGAÇÃO', art: 'station',
    description: 'Quatro funções, uma nave. Conversem para preparar a expedição.',
    mode: 'Turnos no mesmo aparelho', url: 'cosmo-crew.html',
    instructions: ['Reúnam o grupo e distribuam as quatro funções.', 'Leiam o desafio da estação, conversem e confirmem uma decisão. Se precisarem, tentem novamente.', 'Passem para a próxima função até preparar as quatro estações. Esta versão é local, sem salas online.']
  }
};

function applyPreview() {
  document.body.classList.toggle('is-blocked', blocked);
  $('previewBlocked').checked = blocked;
  $('blockedState').hidden = !blocked;
  if ($('entryContent')) $('entryContent').hidden = blocked;
  if ($('galaxyContent')) $('galaxyContent').hidden = blocked;
  if ($('gameList')) $('gameList').hidden = blocked;
  $('accessState').textContent = blocked ? 'Prévia: acesso bloqueado' : 'Prévia: acesso liberado';
  if ($('universeObjects')) {
    $('universeObjects').inert = blocked;
    if (blocked) $('destinationPanel').hidden = true;
    document.querySelector('.universe-bottom').hidden = blocked;
  }
}
function openDialog(dialog) {
  origin = document.activeElement;
  dialog.showModal();
}
function restoreFocus() {
  const target = origin?.isConnected && origin.getClientRects().length
    ? origin : document.querySelector('[data-preview]');
  target?.focus();
}
function closeDialog(dialog) { dialog.close(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', restoreFocus);
  dialog.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => closeDialog(dialog));
  });
});
document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.closest('#blockedState')) {
      blocked = false;
      applyPreview();
      try { sessionStorage.removeItem(key); } catch { /* A prévia desta página já foi restaurada. */ }
      document.querySelector('[data-preview]').focus();
      return;
    }
    $('previewStatus').textContent = 'A simulação vale apenas nesta aba e para a entrada e a galáxia. Não bloqueia os endereços diretos dos jogos.';
    openDialog($('previewDialog'));
  });
});
$('previewBlocked').addEventListener('change', () => {
  blocked = $('previewBlocked').checked;
  applyPreview();
  try {
    sessionStorage.setItem(key, blocked ? 'bloqueado' : 'liberado');
    $('previewStatus').textContent = 'Estado de demonstração salvo nesta aba. Nenhuma permissão real foi alterada.';
  } catch {
    $('previewStatus').textContent = 'O navegador não permitiu salvar a prévia. O estado vale somente enquanto esta página estiver aberta.';
  }
});
applyPreview();

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
  const progress = readProgress();
  $('selectedProgress').textContent = id === 'robo'
    ? (progress.robo ? progress.robo + '/3 desafios concluídos aqui' : '3 desafios de programação')
    : id === 'quiz' ? (progress.quiz != null ? 'Melhor resultado local: ' + progress.quiz + '/6' : '6 perguntas, no seu ritmo')
      : progress.crew ? 'Expedição concluída neste navegador' : 'Turnos no mesmo aparelho';
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
if ($('gameList')) {
  function progress() {
    const saved = readProgress();
    $('roboProgress').textContent = saved.robo ? saved.robo + ' de 3 desafios concluídos aqui' : '3 desafios de programação';
    $('quizProgress').textContent = saved.quiz != null ? 'Melhor resultado local: ' + saved.quiz + '/6' : '6 perguntas, no seu ritmo';
    $('crewProgress').textContent = saved.crew ? 'Expedição concluída neste aparelho' : 'Turnos no mesmo aparelho';
  }
  progress();
  window.addEventListener('pageshow', progress);
  window.addEventListener('storage', event => { if (event.key === 'astrolearn-games-v1') progress(); });
}

initSpaceEffects();
if ($('universeViewport')) initUniverse();
