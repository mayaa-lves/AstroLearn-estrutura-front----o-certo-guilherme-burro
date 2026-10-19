import { sessaoObrigatoria } from '../../services/conexao.js';
import { dashboard } from '../../services/aluno.js';

const session = sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);

const statusNames = {
  todo: 'A fazer',
  doing: 'Em andamento',
  done: 'Concluída'
};

const kindNames = {
  idea: 'Ideia',
  notice: 'Aviso',
  agreement: 'Combinado'
};

const emptyDraft = () => ({
  version: 1,
  tasks: [],
  notes: []
});

let team = null;
let members = [];
let draft = emptyDraft();
let draftKey = '';
let busy = false;
let ready = false;
let editingTask = null;
let removal = null;
let toastTimer;

const openers = new WeakMap();

const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  Date.now().toString(36) + Math.random().toString(36).slice(2);

function element(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function portrait(index, className = '') {
  const node = element(
    'span',
    '',
    `portrait portrait-${index % 4} ${className}`
  );

  node.setAttribute('aria-hidden', 'true');
  return node;
}

function iconButton(label, path) {
  const button = element('button', '', 'icon-button');

  button.type = 'button';
  button.setAttribute('aria-label', label);

  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="${path}"/>
    </svg>
  `;

  return button;
}

function tell(message) {
  clearTimeout(toastTimer);

  $('teamToast').textContent = message;
  $('teamToast').hidden = false;

  toastTimer = setTimeout(() => {
    $('teamToast').hidden = true;
  }, 2800);
}

function show(dialog, trigger) {
  openers.set(dialog, trigger || document.activeElement);

  if (!dialog.open) {
    dialog.showModal();
  }

  (
    dialog.querySelector('input') ||
    dialog.querySelector('button')
  )?.focus();
}

function controls(enabled) {
  ['organize', 'idea', 'noteType', 'saveNote'].forEach(name => {
    $(name).disabled = !enabled;
  });
}

/* Valida dados recuperados do navegador. */
function validate(raw) {
  if (
    !raw ||
    raw.version !== 1 ||
    !Array.isArray(raw.tasks) ||
    !Array.isArray(raw.notes)
  ) {
    throw Error('Formato inválido.');
  }

  const tasks = raw.tasks
    .filter(task =>
      task &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      task.title.trim() &&
      typeof task.owner === 'string' &&
      Object.hasOwn(statusNames, task.status)
    )
    .slice(0, 60)
    .map(task => ({
      id: task.id.slice(0, 140),
      title: task.title.trim().slice(0, 100),
      owner: task.owner.slice(0, 200),
      status: task.status
    }));

  const notes = raw.notes
    .filter(note =>
      note &&
      typeof note.id === 'string' &&
      typeof note.text === 'string' &&
      note.text.trim() &&
      Object.hasOwn(kindNames, note.kind) &&
      typeof note.createdAt === 'string' &&
      Number.isFinite(Date.parse(note.createdAt))
    )
    .slice(0, 80)
    .map(note => ({
      id: note.id.slice(0, 140),
      text: note.text.trim().slice(0, 1000),
      kind: note.kind,
      pinned: note.pinned === true,
      createdAt: note.createdAt
    }));

  return {
    version: 1,
    tasks: [...new Map(tasks.map(task => [task.id, task])).values()],
    notes: [...new Map(notes.map(note => [note.id, note])).values()]
  };
}

function readDraft() {
  draft = emptyDraft();
  $('storageNotice').textContent = '';

  try {
    const saved = localStorage.getItem(draftKey);

    if (saved) {
      draft = validate(JSON.parse(saved));
    }
  } catch {
    $('storageNotice').textContent =
      'Não foi possível recuperar seu rascunho neste navegador. Novas alterações ficam nesta página até que seja possível salvá-las.';
  }
}

function saveDraft() {
  if (!ready || !draftKey) return false;

  try {
    localStorage.setItem(
      draftKey,
      JSON.stringify(draft)
    );

    $('storageNotice').textContent = '';
    return true;
  } catch {
    $('storageNotice').textContent =
      'O navegador não permitiu salvar. As alterações atuais ficam somente nesta página e podem se perder ao sair.';

    return false;
  }
}

function saveAndRender(message) {
  const saved = saveDraft();

  renderWorkspace();

  tell(
    saved
      ? message
      : 'Alteração mantida somente nesta página.'
  );
}

function ownerName(owner) {
  const member = members.find(item => item.id === owner);

  return !member
    ? 'Integrante indisponível'
    : owner === session.usuario.id
      ? 'Você'
      : member.nome;
}

/* Integrantes reais da equipe. */
function showMember(member, index, trigger) {
  $('memberPortrait').className =
    'portrait portrait-' + index % 4;

  $('memberTitle').textContent =
    member.nome +
    (member.id === session.usuario.id ? ' (você)' : '');

  $('memberTasks').replaceChildren();

  const tasks = draft.tasks.filter(
    task => task.owner === member.id
  );

  tasks.forEach(task => {
    $('memberTasks').append(
      element(
        'li',
        `${task.title} · ${statusNames[task.status]}`
      )
    );
  });

  if (!tasks.length) {
    $('memberTasks').append(
      element(
        'li',
        'Sem responsabilidades no seu rascunho.'
      )
    );
  }

  show($('memberDialog'), trigger);
}

function renderMembers() {
  $('members').replaceChildren();

  members.forEach((member, index) => {
    const button = element('button', '', 'member');

    button.type = 'button';

    button.setAttribute(
      'aria-label',
      `Ver planejamento pessoal de ${member.nome}`
    );

    const copy = element('span', '', 'member-copy');

    const count = draft.tasks.filter(
      task => task.owner === member.id
    ).length;

    copy.append(
      element(
        'strong',
        member.id === session.usuario.id
          ? member.nome + ' (você)'
          : member.nome
      ),
      element(
        'span',
        count
          ? `${count} ${count === 1 ? 'tarefa' : 'tarefas'} no rascunho`
          : 'Integrante da equipe'
      )
    );

    button.append(portrait(index), copy);

    button.addEventListener('click', () => {
      showMember(member, index, button);
    });

    $('members').append(button);
  });
}

/* Tarefas do rascunho pessoal. */
function openTask(task, trigger) {
  if (!ready) return;

  if (!task && draft.tasks.length >= 60) {
    tell(
      'Seu rascunho já tem 60 tarefas. Remova uma antes de adicionar outra.'
    );
    return;
  }

  editingTask = task?.id || null;

  $('taskDialogTitle').textContent =
    task ? 'Editar tarefa' : 'Adicionar tarefa';

  $('taskTitle').value = task?.title || '';

  $('taskOwner').replaceChildren(
    element('option', 'Selecione um integrante')
  );

  $('taskOwner').firstChild.value = '';

  members.forEach(member => {
    const option = element(
      'option',
      ownerName(member.id)
    );

    option.value = member.id;
    $('taskOwner').append(option);
  });

  $('taskOwner').value =
    task?.owner || session.usuario.id;

  $('taskStatus').value =
    task?.status || 'todo';

  $('taskError').textContent = '';

  show($('taskDialog'), trigger);
}

function askRemove(type, targetId, trigger) {
  if (!ready) return;

  removal = {
    type,
    id: targetId
  };

  $('removeTitle').textContent =
    type === 'task'
      ? 'Remover tarefa do seu rascunho?'
      : 'Remover sua anotação?';

  show($('removeDialog'), trigger);
}

function renderTasks() {
  $('taskList').replaceChildren();

  $('tasksEmpty').hidden =
    draft.tasks.length > 0;

  draft.tasks.forEach(task => {
    const row = element(
      'li',
      '',
      'task ' + task.status
    );

    const checkLabel = element(
      'label',
      '',
      'task-check'
    );

    const check = document.createElement('input');

    check.type = 'checkbox';
    check.checked = task.status === 'done';
    check.dataset.taskId = task.id;

    check.setAttribute(
      'aria-label',
      `Marcar ${task.title} como ${check.checked ? 'não concluída' : 'concluída'
      } no seu rascunho`
    );

    check.addEventListener('change', () => {
      task.status = check.checked ? 'done' : 'todo';

      saveAndRender(
        'Situação atualizada no seu rascunho.'
      );

      [...$('taskList').querySelectorAll('input')]
        .find(node => node.dataset.taskId === task.id)
        ?.focus();
    });

    checkLabel.append(check);

    const copy = element('div', '', 'task-copy');

    copy.append(
      element('strong', task.title),
      element('span', ownerName(task.owner))
    );

    const edit = iconButton(
      'Editar tarefa: ' + task.title,
      'm15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z'
    );

    edit.addEventListener('click', () => {
      openTask(task, edit);
    });

    const remove = iconButton(
      'Remover tarefa: ' + task.title,
      'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7'
    );

    remove.addEventListener('click', () => {
      askRemove('task', task.id, remove);
    });

    row.append(
      checkLabel,
      copy,
      element(
        'span',
        statusNames[task.status],
        'task-state'
      ),
      edit,
      remove
    );

    $('taskList').append(row);
  });
}

/* Anotações do rascunho pessoal. */
function renderNotes() {
  $('wall').replaceChildren();

  $('wallEmpty').hidden =
    draft.notes.length > 0;

  const notes = [...draft.notes].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );

  notes.forEach(note => {
    const row = element(
      'li',
      '',
      'idea-note' + (note.pinned ? ' pinned' : '')
    );

    const copy = element(
      'div',
      '',
      'idea-content'
    );

    const time = element(
      'time',
      new Date(note.createdAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    time.dateTime = note.createdAt;

    copy.append(
      element('strong', 'Você'),
      time,
      element(
        'span',
        kindNames[note.kind] +
        (note.pinned ? ' · Fixada' : ''),
        'note-kind'
      ),
      element('p', note.text)
    );

    const pin = iconButton(
      note.pinned
        ? 'Desafixar anotação'
        : 'Fixar anotação',
      'm8 3 8 0-1 6 4 4H5l4-4ZM12 13v8'
    );

    pin.setAttribute(
      'aria-pressed',
      String(note.pinned)
    );

    pin.addEventListener('click', () => {
      note.pinned = !note.pinned;

      saveAndRender(
        note.pinned
          ? 'Anotação fixada no seu rascunho.'
          : 'Anotação desafixada.'
      );

      $('idea').focus();
    });

    const remove = iconButton(
      'Remover anotação',
      'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7'
    );

    remove.addEventListener('click', () => {
      askRemove('note', note.id, remove);
    });

    row.append(
      portrait(0),
      copy,
      pin,
      remove
    );

    $('wall').append(row);
  });
}

function renderWorkspace() {
  renderMembers();
  renderTasks();
  renderNotes();
}

/* Usa apenas uma atividade real disponível na trilha. */
function renderMission(data) {
  const periods = Array.isArray(data.periodos_trilha)
    ? data.periodos_trilha
    : [];

  const mission = periods
    .filter(period => period?.acessivel !== false)
    .flatMap(period =>
      Array.isArray(period?.missoes)
        ? period.missoes
        : []
    )
    .find(item =>
      item &&
      typeof item.id === 'string' &&
      item.status_aluno === 'disponivel'
    );

  $('missionTitle').textContent =
    mission?.titulo ||
    'As atividades continuam na sua trilha';

  $('missionDescription').textContent =
    mission?.descricao ||
    'Consulte as orientações do professor para saber quais atividades devem ser feitas em equipe.';

  $('missionLink').textContent =
    mission
      ? 'Abrir atividade →'
      : 'Ir para minha trilha →';

  $('missionLink').href =
    mission
      ? 'atividade.html?atividade=' +
      encodeURIComponent(mission.id)
      : 'home.html#journey';
}

async function load() {
  if (busy) return;

  busy = true;
  ready = false;
  team = null;
  members = [];
  draft = emptyDraft();
  draftKey = '';

  controls(false);

  $('refresh').disabled = true;
  $('workspace').hidden = true;
  $('noTeam').hidden = true;
  $('memberHint').hidden = true;
  $('loadError').hidden = true;

  $('storageNotice').textContent = '';
  $('teamLabel').textContent = 'Carregando equipe…';
  $('teamPeriod').textContent = '';

  $('members').replaceChildren();
  $('members').setAttribute('aria-busy', 'true');

  document.querySelectorAll('dialog[open]').forEach(dialog => {
    dialog.close();
  });

  try {
    const data = await dashboard();

    if (!data?.equipe) {
      $('teamLabel').textContent = 'Sem equipe';
      $('noTeam').hidden = false;
      return;
    }

    team = data.equipe;

    const roster = [
      session.usuario,
      ...(
        Array.isArray(data.colegas)
          ? data.colegas
          : []
      )
    ];

    const unique = new Map();

    roster.forEach(member => {
      if (
        member &&
        typeof member.id === 'string' &&
        member.id &&
        !unique.has(member.id)
      ) {
        unique.set(member.id, {
          id: member.id,
          nome:
            typeof member.nome === 'string' &&
              member.nome.trim()
              ? member.nome
              : 'Integrante'
        });
      }
    });

    members = [...unique.values()];

    $('teamLabel').textContent =
      `${team.nome || 'Minha equipe'} · ${members.length
      } ${members.length === 1 ? 'integrante' : 'integrantes'
      }`;

    $('teamPeriod').textContent =
      typeof data.equipe_periodo_nome === 'string'
        ? data.equipe_periodo_nome
        : '';

    if (
      typeof team.id !== 'string' ||
      !team.id
    ) {
      throw Error(
        'Não foi possível identificar a equipe. Tente atualizar.'
      );
    }

    draftKey =
      'astrolearn-equipe-rascunho-v1:' +
      encodeURIComponent(session.usuario.id) +
      ':' +
      encodeURIComponent(team.id);

    readDraft();
    renderMission(data);

    ready = true;

    renderWorkspace();

    $('workspace').hidden = false;
    $('memberHint').hidden = false;

    controls(true);
  } catch (error) {
    $('teamLabel').textContent =
      'Não foi possível carregar a equipe';

    $('loadError').textContent =
      error.message || 'Tente atualizar novamente.';

    $('loadError').hidden = false;
  } finally {
    busy = false;

    $('refresh').disabled = false;
    $('members').setAttribute('aria-busy', 'false');
  }
}

$('refresh').addEventListener('click', load);

$('organize').addEventListener('click', () => {
  openTask(null, $('organize'));
});

$('taskForm').addEventListener('submit', event => {
  event.preventDefault();

  if (!ready) return;

  const title = $('taskTitle').value.trim();
  const owner = $('taskOwner').value;
  const status = $('taskStatus').value;

  $('taskError').textContent = '';

  if (!title) {
    $('taskError').textContent = 'Descreva a tarefa.';
    $('taskTitle').focus();
    return;
  }

  if (!members.some(member => member.id === owner)) {
    $('taskError').textContent =
      'Selecione um integrante da equipe atual.';

    $('taskOwner').focus();
    return;
  }

  if (!Object.hasOwn(statusNames, status)) return;

  if (editingTask) {
    const task = draft.tasks.find(
      item => item.id === editingTask
    );

    if (!task) {
      $('taskError').textContent =
        'A tarefa já foi removida. Feche e crie uma nova.';
      return;
    }

    Object.assign(task, {
      title: title.slice(0, 100),
      owner,
      status
    });
  } else {
    if (draft.tasks.length >= 60) {
      $('taskError').textContent =
        'Limite de 60 tarefas neste rascunho.';
      return;
    }

    draft.tasks.push({
      id: id(),
      title: title.slice(0, 100),
      owner,
      status
    });
  }

  saveAndRender('Tarefa salva no seu rascunho.');

  $('taskDialog').close();
});

$('idea').addEventListener('input', () => {
  $('ideaCount').textContent =
    $('idea').value.length + ' / 1000';

  $('formError').textContent = '';
});

$('ideaForm').addEventListener('submit', event => {
  event.preventDefault();

  if (!ready) return;

  const text = $('idea').value.trim();
  const kind = $('noteType').value;

  if (!text) {
    $('formError').textContent =
      'Escreva sua anotação antes de salvar.';

    $('idea').focus();
    return;
  }

  if (!Object.hasOwn(kindNames, kind)) return;

  if (draft.notes.length >= 80) {
    $('formError').textContent =
      'Limite de 80 anotações neste rascunho. Remova uma para continuar.';
    return;
  }

  draft.notes.push({
    id: id(),
    text: text.slice(0, 1000),
    kind,
    pinned: false,
    createdAt: new Date().toISOString()
  });

  saveAndRender(
    'Anotação salva no seu rascunho pessoal.'
  );

  $('idea').value = '';
  $('ideaCount').textContent = '0 / 1000';
  $('formError').textContent = '';

  $('wallStatus').textContent =
    'Anotação adicionada ao rascunho pessoal.';

  $('idea').focus();
});

$('confirmRemove').addEventListener('click', () => {
  if (!ready || !removal) return;

  if (removal.type === 'task') {
    draft.tasks = draft.tasks.filter(
      task => task.id !== removal.id
    );
  } else {
    draft.notes = draft.notes.filter(
      note => note.id !== removal.id
    );
  }

  saveAndRender('Item removido do seu rascunho.');

  $('removeDialog').close();
});

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => {
    button.closest('dialog').close();
  });
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    const opener = openers.get(dialog);

    if (
      opener?.isConnected &&
      opener.getClientRects().length
    ) {
      opener.focus({ preventScroll: true });
    } else {
      (
        ready
          ? $('organize')
          : $('refresh')
      ).focus({ preventScroll: true });
    }

    if (dialog.id === 'removeDialog') {
      removal = null;
    }
  });
});

addEventListener('storage', event => {
  if (
    ready &&
    (
      event.key === draftKey ||
      event.key === null
    )
  ) {
    readDraft();
    renderWorkspace();
  }
});

/* Estrelas: fluxo, resposta ao mouse e criação no clique. */

const canvas = $('teamStars');
const ctx = canvas.getContext('2d');

const media = matchMedia(
  '(prefers-reduced-motion: reduce)'
);

const cursor = {
  x: -999,
  y: -999
};

const stars = [];

let width = innerWidth;
let height = innerHeight;
let frame = 0;
let last = 0;

const stopped = () =>
  media.matches ||
  document.body.classList.contains('astro-motion-off') ||
  document.hidden;

function addStar(
  x = Math.random() * width,
  y = Math.random() * height,
  born = false
) {
  if (stars.length >= 80) stars.shift();

  stars.push({
    x,
    y,
    r: born ? 1.5 : .5 + Math.random(),
    vx: 0,
    vy: 0,
    speed: 5 + Math.random() * 8,
    age: 0,
    born,
    pin: born ? .8 : 0
  });
}

function draw(dt) {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  for (let i = stars.length - 1; i >= 0; i--) {
    const particle = stars[i];

    particle.age += dt;

    if (particle.born && particle.age > 12) {
      stars.splice(i, 1);
      continue;
    }

    if (dt && particle.pin <= 0) {
      const dx = particle.x - cursor.x;
      const dy = particle.y - cursor.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 130 && distance > 0) {
        const force =
          (1 - distance / 130) * 170;

        particle.vx += dx / distance * force * dt;
        particle.vy += dy / distance * force * dt;
      }

      particle.vx *= Math.exp(-3 * dt);
      particle.vy *= Math.exp(-3 * dt);

      particle.x += (
        particle.speed + particle.vx
      ) * dt;

      particle.y += (
        -particle.speed * .12 + particle.vy
      ) * dt;

      if (particle.x > width + 5) particle.x = -5;
      if (particle.x < -10) particle.x = width + 5;
      if (particle.y < -5) particle.y = height + 5;
      if (particle.y > height + 10) particle.y = -5;
    } else {
      particle.pin -= dt;
    }

    const alpha = particle.born
      ? Math.min(.8, (12 - particle.age) / 3)
      : .16;

    ctx.fillStyle = particle.born
      ? `rgba(225,198,249,${alpha})`
      : `rgba(174,147,191,${alpha})`;

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      particle.r,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (particle.born) {
      ctx.strokeStyle =
        `rgba(225,198,249,${alpha})`;

      ctx.lineWidth = .7;

      ctx.beginPath();

      ctx.moveTo(particle.x - 4, particle.y);
      ctx.lineTo(particle.x + 4, particle.y);

      ctx.moveTo(particle.x, particle.y - 4);
      ctx.lineTo(particle.x, particle.y + 4);

      ctx.stroke();
    }
  }
}

function tick(now) {
  frame = 0;

  if (stopped()) return;

  const dt = last
    ? Math.min((now - last) / 1000, .04)
    : 0;

  last = now;

  draw(dt);

  frame = requestAnimationFrame(tick);
}

function sync() {
  cancelAnimationFrame(frame);

  frame = 0;
  last = 0;

  draw(0);

  if (!stopped() && ctx) {
    frame = requestAnimationFrame(tick);
  }
}

function resize() {
  width = innerWidth;
  height = innerHeight;

  const dpr = Math.min(
    devicePixelRatio || 1,
    1.5
  );

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

  stars.length = 0;

  for (
    let i = 0;
    i < (width < 600 ? 22 : 36);
    i++
  ) {
    addStar();
  }

  sync();
}

addEventListener('pointermove', event => {
  if (
    event.pointerType === 'touch' ||
    stopped()
  ) {
    return;
  }

  cursor.x = event.clientX;
  cursor.y = event.clientY;
}, { passive: true });

document.documentElement.addEventListener(
  'pointerleave',
  () => {
    cursor.x = cursor.y = -999;
  }
);

document.addEventListener('click', event => {
  if (
    stopped() ||
    event.target.closest(
      'a,button,input,textarea,select,label,dialog,.sidebar,.member,.task,.idea-note,astro-assistente,#astroAccountTools'
    )
  ) {
    return;
  }

  addStar(
    event.clientX,
    event.clientY,
    true
  );

  draw(0);
});

addEventListener('resize', resize);

document.addEventListener(
  'visibilitychange',
  sync
);

document.addEventListener(
  'astrolearn:motion',
  sync
);

media.addEventListener('change', sync);

new MutationObserver(sync).observe(
  document.body,
  {
    attributes: true,
    attributeFilter: ['class']
  }
);

addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  clearTimeout(toastTimer);
  frame = 0;
});

addEventListener('pageshow', sync);

resize();
load();