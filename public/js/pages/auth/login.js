// Etapa 1: aparência e interações.
// Não faz autenticação nem redireciona.

const pegar = (id) => document.getElementById(id);

const mascote = pegar('mascote');
const senha = pegar('senha');
const foguete = pegar('foguete');
const mensagem = pegar('mascot-message');
const movimento = pegar('pausar-movimentos');

const preferencia = matchMedia('(prefers-reduced-motion: reduce)');

let pausaManual = false;
let timerPose;
let timerMensagem;
let timerFoguete;
let frame;
let ponteiro;
let processando = false;

// ========================================
// 1. MENSAGENS DO MASCOTE
// ========================================

function falar(texto) {
  clearTimeout(timerMensagem);

  mensagem.textContent = texto;
  mensagem.classList.add('is-visible');

  timerMensagem = setTimeout(() => {
    mensagem.classList.remove('is-visible');
  }, 3500);
}

// ========================================
// 2. SENHA E POSES DO MASCOTE
// ========================================

// A privacidade vale também quando a senha é revelada.
function atualizarPrivacidade() {
  clearTimeout(timerPose);

  mascote.dataset.pose =
    document.activeElement === senha ? 'senha' : 'normal';
}

senha.addEventListener('focus', () => {
  atualizarPrivacidade();
  falar('Pode digitar. Eu não estou olhando!');
});

senha.addEventListener('input', atualizarPrivacidade);
senha.addEventListener('blur', atualizarPrivacidade);

pegar('mostrar-senha').addEventListener('click', (event) => {
  const mostrar = senha.type === 'password';

  senha.type = mostrar ? 'text' : 'password';

  event.currentTarget.setAttribute(
    'aria-label',
    mostrar ? 'Ocultar senha' : 'Mostrar senha'
  );

  event.currentTarget.setAttribute('aria-pressed', String(mostrar));

  senha.focus();
  atualizarPrivacidade();
});

mascote.addEventListener('click', () => {
  clearTimeout(timerPose);

  mascote.dataset.pose = 'aceno';
  falar('Oi! Toda descoberta começa com uma pergunta.');

  timerPose = setTimeout(atualizarPrivacidade, 1800);
});

// ========================================
// 3. OLHO ACOMPANHANDO O MOUSE
// ========================================

// Atualiza apenas uma vez por frame.
function seguirPonteiro() {
  frame = null;

  const caixa = mascote.getBoundingClientRect();

  const dx = ponteiro.x - (caixa.left + caixa.width * .486);
  const dy = ponteiro.y - (caixa.top + caixa.height * .425);

  const distancia = Math.hypot(dx, dy) || 1;
  const deslocamento = Math.min(
    distancia * .035,
    caixa.width * .033
  );

  mascote.style.setProperty(
    '--eye-x',
    `${dx / distancia * deslocamento}px`
  );

  mascote.style.setProperty(
    '--eye-y',
    `${dy / distancia * deslocamento}px`
  );

  // Movimento discreto do cenário.
  document.body.style.setProperty(
    '--scene-x',
    `${(ponteiro.x / innerWidth - .5) * 4}px`
  );

  document.body.style.setProperty(
    '--scene-y',
    `${(ponteiro.y / innerHeight - .5) * 3}px`
  );
}

function centralizarOlhar() {
  cancelAnimationFrame(frame);
  frame = null;

  mascote.style.setProperty('--eye-x', '0px');
  mascote.style.setProperty('--eye-y', '0px');

  document.body.style.setProperty('--scene-x', '0px');
  document.body.style.setProperty('--scene-y', '0px');
}

document.addEventListener('pointermove', (event) => {
  if (
    event.pointerType === 'touch' ||
    document.hidden ||
    document.body.classList.contains('motion-paused')
  ) {
    return;
  }

  ponteiro = {
    x: event.clientX,
    y: event.clientY
  };

  if (frame == null) {
    frame = requestAnimationFrame(seguirPonteiro);
  }
});

document.documentElement.addEventListener(
  'pointerleave',
  centralizarOlhar
);

// ========================================
// 4. CONTROLE DE MOVIMENTO
// ========================================

function atualizarMovimentos() {
  const pausado = pausaManual || preferencia.matches;

  document.body.classList.toggle('motion-paused', pausado);

  movimento.setAttribute('aria-pressed', String(pausado));
  movimento.disabled = preferencia.matches;

  movimento.textContent = preferencia.matches
    ? 'Movimentos reduzidos'
    : pausado
      ? 'Ativar movimentos'
      : 'Pausar movimentos';

  if (pausado) {
    centralizarOlhar();
  }
}

movimento.addEventListener('click', () => {
  pausaManual = !pausaManual;
  atualizarMovimentos();
});

preferencia.addEventListener('change', atualizarMovimentos);

atualizarMovimentos();

// ========================================
// 5. DECOLAGEM DO FOGUETE
// ========================================

function decolar() {
  if (foguete.classList.contains('is-flying')) {
    return;
  }

  foguete.classList.add('is-flying');
  falar('3… 2… 1… decolagem!');

  clearTimeout(timerFoguete);

  timerFoguete = setTimeout(() => {
    foguete.classList.remove('is-flying');
  }, 2100);
}

foguete.addEventListener('click', decolar);

// ========================================
// 6. ESTRELAS COM CURIOSIDADES
// ========================================

// Diálogo nativo: teclado, Escape e retorno ao botão.
document.querySelectorAll('[data-curiosidade]').forEach((estrela) => {
  estrela.addEventListener('click', () => {
    pegar('curiosidade-text').textContent =
      estrela.dataset.curiosidade;

    pegar('curiosidade').showModal();
  });
});

pegar('fechar-curiosidade').addEventListener('click', () => {
  pegar('curiosidade').close();
});

// ========================================
// 7. VALIDAÇÃO VISUAL DO FORMULÁRIO
// ========================================

function mostrarErro(id, texto) {
  pegar(`${id}-error`).textContent = texto;
  pegar(id).setAttribute('aria-invalid', String(Boolean(texto)));
}

['email', 'senha'].forEach((id) => {
  pegar(id).addEventListener('input', () => {
    mostrarErro(id, '');
    pegar('login-status').textContent = '';
  });
});

pegar('login-form').addEventListener('submit', (event) => {
  event.preventDefault();

  if (processando) {
    return;
  }

  const emailValido =
    pegar('email').value.trim() !== '' &&
    pegar('email').validity.valid;

  const senhaValida = senha.value.length > 0;

  mostrarErro(
    'email',
    emailValido ? '' : 'Digite um e-mail válido.'
  );

  mostrarErro(
    'senha',
    senhaValida ? '' : 'Digite sua senha.'
  );

  if (!emailValido || !senhaValida) {
    (emailValido ? senha : pegar('email')).focus();
    return;
  }

  processando = true;

  pegar('entrar').disabled = true;
  pegar('entrar').textContent = 'Testando decolagem…';

  pegar('login-status').textContent =
    'Prévia visual: nenhuma conta está sendo autenticada.';

  decolar();

  const tempo = document.body.classList.contains('motion-paused')
    ? 200
    : 2100;

  setTimeout(() => {
    pegar('entrar').disabled = false;
    pegar('entrar').textContent = 'Entrar na plataforma →';

    pegar('login-status').textContent =
      'Interação concluída. Na próxima etapa, conectaremos o acesso real.';

    processando = false;
  }, tempo);
});

// Evita deixar o foguete preso ao trocar de aba.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    centralizarOlhar();

    clearTimeout(timerFoguete);
    foguete.classList.remove('is-flying');
  }
});