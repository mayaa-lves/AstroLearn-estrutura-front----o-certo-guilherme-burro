/* Prévia do aluno: conteúdo demonstrativo, sem simular autenticação ou persistência escolar. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    dialog = $("dialog");
  // Menu flutuante: recolhido mantém todos os botões acessíveis pelos ícones.

  let action = null,
    trigger = null;
  function open(
    title,
    content,
    kicker = "ASTROLEARN",
    label = "Entendi",
    callback = null,
  ) {
    trigger = document.activeElement;
    $("dialogTitle").textContent = title;
    $("dialogContent").innerHTML = content;
    $("dialogKicker").textContent = kicker;
    $("dialogAction").textContent = label;
    action = callback;
    document.body.classList.add("activity-open");
    document.dispatchEvent(new CustomEvent("astrolearn:reading"));
    dialog.showModal();
    $("closeDialog").focus();
  }
  function close() {
    document.body.classList.remove("activity-open");
    dialog.close();
    if (trigger && trigger.isConnected) trigger.focus();
  }
  $("closeDialog").onclick = close;
  $("dialogAction").onclick = () => {
    if (action) action();
    else close();
  };
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        close();
    }
  });
  dialog.addEventListener("close", () =>
    document.body.classList.remove("activity-open"),
  );
  dialog.addEventListener("cancel", () =>
    setTimeout(() => trigger?.focus(), 0),
  );
  let missions = [],
    currentStep = -1,
    dashboard = null;
  const templates = [...document.querySelectorAll(".step")].map((e) =>
    e.cloneNode(true),
  );
  document.querySelector(".steps").replaceChildren();
  $("introMission").textContent = "Carregando suas missões…";
  $("progress").querySelector("strong").textContent = "Carregando…";
  const connection = import("../../services/conexao.js");
  const services = import("../../services/aluno.js");
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function mission(i) {
    const m = missions[i];
    if (!m) return;
    if (m.status_aluno === "bloqueada") {
      open(
        "Mundo desconhecido",
        "<p>Conclua e aguarde a validação da missão anterior para explorar este planeta.</p>",
      );
      return;
    }
    location.assign("atividade.html?atividade=" + encodeURIComponent(m.id));
  }
  window.AstroLearnJourney = { mission, getCurrent: () => currentStep };
  async function loadJourney() {
    const c = await connection;
    const session = c.sessaoObrigatoria("aluno");
    const service = await services;
    $("continue").disabled = true;
    try {
      dashboard = await service.dashboard();
      missions = (dashboard.periodos_trilha || []).flatMap((p) =>
        (p.missoes || []).map((m) => ({
          ...m,
          periodo_nome: p.nome,
          status_aluno: p.acessivel === false ? "bloqueada" : m.status_aluno,
        })),
      );
      currentStep = missions.findIndex((m) => m.status_aluno === "disponivel");
      if (currentStep < 0)
        currentStep = missions.findIndex(
          (m) =>
            m.status_aluno !== "bloqueada" && m.status_aluno !== "concluida",
        );
      const list = document.querySelector(".steps");
      list.replaceChildren();
      const labels = {
        disponivel: "Disponível",
        entregue: "Aguardando correção",
        concluida: "Concluída",
        corrigida_sem_validacao: "Confira a correção",
        bloqueada: "Mundo desconhecido",
      };
      missions.forEach((m, i) => {
        const e = templates[i % templates.length].cloneNode(true);
        e.classList.toggle("locked", m.status_aluno === "bloqueada");
        e.classList.toggle("done", m.status_aluno === "concluida");
        e.classList.toggle("current", i === currentStep);
        e.querySelector(".here")?.remove();
        e.querySelector("h2").textContent =
          m.status_aluno === "bloqueada" ? "Mundo desconhecido" : m.titulo;
        e.querySelector(".step-number").textContent = i + 1;
        e.querySelector(".step-copy p").textContent =
          m.status_aluno === "bloqueada"
            ? "Uma nova descoberta espera por você."
            : m.periodo_nome +
              " · " +
              (labels[m.status_aluno] || "Confira sua atividade");
        const b = e.querySelector(".planet");
        b.dataset.step = i;
        b.setAttribute(
          "aria-label",
          labels[m.status_aluno] +
            ": " +
            (m.status_aluno === "bloqueada" ? "próxima missão" : m.titulo),
        );
        b.onclick = () => mission(i);
        e.querySelector(".planet-status").textContent =
          m.status_aluno === "concluida"
            ? "✓"
            : m.status_aluno === "bloqueada"
              ? "🔒"
              : m.status_aluno === "entregue"
                ? "⌛"
                : "▶";
        list.append(e);
      });
      $("introMission").textContent =
        missions[currentStep]?.titulo ||
        (dashboard.tem_sala
          ? "Nenhuma missão disponível"
          : "Entre na sua turma");
      document.querySelector(".intro-detail span").textContent =
        dashboard.sala?.nome || "Peça o código ao professor";
      $("progress").querySelector("strong").textContent =
        (dashboard.concluidas || 0) +
        " / " +
        (dashboard.total || 0) +
        " missões";
      $("continue").textContent = dashboard.tem_sala
        ? currentStep >= 0
          ? "Continuar missão"
          : "Consultar trilha"
        : "Entrar na turma";
      $("continue").onclick = dashboard.tem_sala
        ? () =>
            currentStep >= 0
              ? mission(currentStep)
              : $("journey").scrollIntoView()
        : join;
      $("continue").disabled = false;
      if (!missions.length) {
        const e = document.createElement("li");
        e.textContent = dashboard.tem_sala
          ? "Seu professor ainda não disponibilizou missões."
          : "Entre em uma turma para iniciar sua expedição.";
        list.append(e);
      }
      document.dispatchEvent(new CustomEvent("astrolearn:journey-loaded"));
    } catch (e) {
      $("introMission").textContent = e.message;
      $("continue").textContent = "Tentar novamente";
      $("continue").onclick = loadJourney;
      $("continue").disabled = false;
    }
  }
  function join() {
    open(
      "Entre na sua turma",
      '<label for="classCode">Código fornecido pelo professor</label><input id="classCode" autocomplete="off" maxlength="30"><p id="classStatus" role="status"></p>',
      "SUA TURMA",
      "Entrar",
      async () => {
        const code = $("classCode").value.trim();
        if (!code) {
          $("classStatus").textContent = "Informe o código.";
          return;
        }
        $("dialogAction").disabled = true;
        try {
          await (await services).entrarSala(code);
          close();
          await loadJourney();
        } catch (e) {
          $("classStatus").textContent = e.message;
        } finally {
          $("dialogAction").disabled = false;
        }
      },
    );
  }
  $("guide").onclick = () =>
    open(
      "Como funciona sua expedição?",
      "<ol><li>Abra a missão disponível.</li><li>Leia as instruções do professor.</li><li>Realize a atividade.</li><li>Aguarde a correção para liberar a próxima etapa.</li></ol>",
    );
  $("progress").onclick = () =>
    open(
      "Sua jornada",
      "<p>" +
        escape(dashboard?.concluidas || 0) +
        " de " +
        escape(dashboard?.total || 0) +
        " missões concluídas.</p>",
    );
  loadJourney();
  const facts = [
    "Vênus gira tão devagar que uma rotação dura mais que uma volta completa dele ao redor do Sol.",
    "A luz do Sol leva cerca de oito minutos para chegar à Terra.",
    "Na Lua, uma queda acontece com gravidade menor que na Terra. A massa de um objeto, porém, continua a mesma.",
  ];
  let fact = 0;
  $("curiosity").onclick = () =>
    open(
      "Uma descoberta do universo",
      `<p>${facts[fact++ % facts.length]}</p>`,
      "ESTRELA DE CURIOSIDADE",
    );

  $("notifications").onclick = () =>
    open(
      "Avisos",
      "<p>Consulte o retorno do professor dentro de cada atividade. Notificações ainda dependem de uma função no backend.</p>",
    );
  $("motion").onclick = () => {
    const reduced = document.body.classList.toggle("motion-reduced");
    $("motion").setAttribute("aria-pressed", String(reduced));
    $("motion").setAttribute(
      "aria-label",
      reduced ? "Permitir animações" : "Reduzir animações",
    );
    document.dispatchEvent(new CustomEvent("astrolearn:motion"));
  };
  const sections = {
    book: [
      "Biblioteca da expedição",
      "Materiais para apoiar sua missão: leitura, vídeos e referências reunidos pelo professor.",
    ],
    team: [
      "Equipe Órion",
      "Nesta prévia, sua tripulação tem quatro integrantes: M, I, G e A. As próximas telas vão mostrar as tarefas e contribuições de cada integrante.",
    ],
    star: [
      "Suas conquistas",
      "As conquistas vão reconhecer investigação, criatividade e colaboração.",
    ],
    shop: [
      "Loja espacial",
      "Aqui você poderá personalizar sua experiência com recompensas de aprendizagem.",
    ],
    user: [
      "Seu perfil de explorador",
      "O perfil reunirá avatar, turma e histórico de descobertas.",
    ],
  };
  document.querySelectorAll("[data-nav]").forEach((b) =>
    b.addEventListener("click", () => {
      const n = b.dataset.nav;
      if (n === "user") {
        window.location.assign("perfil.html");
        return;
      }
      if (n === "shop") {
        window.location.assign("loja.html");
        return;
      }
      if (n === "team") {
        window.location.assign("equipe.html");
        return;
      }
      if (n === "book") {
        window.location.assign("biblioteca.html");
        return;
      }
      if (n === "star") {
        window.location.assign("conquistas.html");
        return;
      }
      if (n === "home") {
        window.scrollTo({
          top: 0,
          behavior:
            document.body.classList.contains("motion-reduced") ||
            document.body.classList.contains("astro-motion-off") ||
            matchMedia("(prefers-reduced-motion:reduce)").matches
              ? "auto"
              : "smooth",
        });
        return;
      }
      if (n === "trail") {
        $("journey").scrollIntoView({
          behavior:
            document.body.classList.contains("motion-reduced") ||
            document.body.classList.contains("astro-motion-off") ||
            matchMedia("(prefers-reduced-motion:reduce)").matches
              ? "auto"
              : "smooth",
          block: "start",
        });
        $("guide").focus({ preventScroll: true });
        return;
      }
      const s = sections[n];
      open(
        s[0],
        `<p>${s[1]}</p><p>Estamos definindo primeiro a tela inicial. Esta área será construída na próxima etapa.</p>`,
        "PRÉVIA DA NAVEGAÇÃO",
      );
    }),
  );

  // Descoberta opcional: um único objeto do cenário abre um desafio educativo.
  const beacon = document.createElement("button");
  beacon.id = "sceneDiscovery";
  beacon.className = "scene-discovery";
  beacon.setAttribute("aria-label", "Explorar satélite: desafio de robótica");
  beacon.innerHTML =
    document.querySelector(".satellite").innerHTML +
    '<span class="scene-tip">Um sinal curioso…</span>';
  document.body.append(beacon);
  beacon.onclick = () => {
    open(
      "Um rover precisa de você!",
      '<p>Um robô explora um planeta com atmosfera, onde o som pode se propagar, e precisa perceber uma rocha à sua frente. Qual equipamento ajudaria a medir a distância até o obstáculo?</p><button class="answer" data-sensor="light">Uma lâmpada para iluminar</button><button class="answer" data-sensor="distance">Um sensor ultrassônico de distância</button><button class="answer" data-sensor="sound">Um alto-falante para emitir música</button><p id="sensorFeedback" role="status" aria-live="polite"></p>',
      "SINAL DO SATÉLITE",
      "Voltar à expedição",
    );
    dialog.querySelectorAll("[data-sensor]").forEach(
      (b) =>
        (b.onclick = () => {
          const right = b.dataset.sensor === "distance";
          $("sensorFeedback").textContent = right
            ? "Isso! Em um ambiente com ar, o sensor emite um pulso sonoro e mede o tempo do eco para estimar a distância. No vácuo do espaço, o som não se propaga: usaríamos outra tecnologia, como lidar."
            : "Esse equipamento não mede a distância. Procure uma opção que detecta a proximidade de um obstáculo.";
          if (right) {
            dialog
              .querySelectorAll("[data-sensor]")
              .forEach((x) => (x.disabled = true));
            beacon.classList.add("discovered");
            beacon.setAttribute("aria-label", "Rever descoberta do satélite");
            document.dispatchEvent(new CustomEvent("astrolearn:answer"));
          }
        }),
    );
  };

  const discoveries = [
    [
      "Observatório da floresta",
      "Compare duas plantas da mesma espécie: o que você manteria igual para investigar a influência da luz?",
    ],
    [
      "Estação de pesquisa",
      "Uma pergunta científica permite medir ou comparar. Qual variável você mudaria no seu experimento?",
    ],
    [
      "Base lunar",
      "Na Lua a gravidade é menor. Como isso mudaria o projeto de um robô explorador?",
    ],
    [
      "Rover de Marte",
      "Um rover precisa perceber obstáculos. Que sensor você escolheria?",
    ],
    [
      "Laboratório criativo",
      "Ciência e arte podem trabalhar juntas: como você desenharia uma estação sustentável?",
    ],
  ];
  document.querySelectorAll(".step").forEach((step, i) => {
    const b = document.createElement("button");
    b.className = "discovery";
    b.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 12-5 3 6-12 5Zm8 4-4 8m4-8 5 8m-5-8v8"/></svg>';
    b.setAttribute("aria-label", "Explorar uma descoberta deste mundo");
    b.onclick = () => {
      if (step.classList.contains("locked")) {
        window.AstroLearnJourney.mission(i);
        return;
      }
      open(
        discoveries[i][0],
        `<p>${discoveries[i][1]}</p>`,
        "PEQUENA DESCOBERTA",
      );
    };
    step.append(b);
    const preview = document.createElement("div");
    preview.className = "mission-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.textContent =
      i === 1
        ? "Individual · 10 min — transforme uma observação em pergunta."
        : i === 2
          ? "Individual · 15 min — planeje um experimento."
          : "Revise suas descobertas.";
    step.append(preview);
  });
})();

/* Experiência visual do aluno. Vistas do avatar são renders, não um modelo WebGL. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () =>
    media.matches ||
    document.body.classList.contains("motion-reduced") ||
    document.body.classList.contains("astro-motion-off");
  /* Curva acompanha os centros dos planetas em qualquer tamanho de tela. */
  function drawPath() {
    const wrap = document.querySelector(".path-wrap"),
      box = wrap.getBoundingClientRect();
    const points = [...document.querySelectorAll(".planet")].map((p) => {
      const r = p.getBoundingClientRect();
      return {
        x: r.left - box.left + r.width / 2,
        y: r.top - box.top + r.height / 2,
      };
    });
    if (!points.length) return;
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1],
        b = points[i],
        mid = (a.y + b.y) / 2;
      d += ` C${a.x},${mid} ${b.x},${mid} ${b.x},${b.y}`;
    }
    $("pathCurve").setAttribute("d", d);
  }
  if (typeof ResizeObserver !== "undefined")
    new ResizeObserver(drawPath).observe(document.querySelector(".path-wrap"));
  window.addEventListener("resize", drawPath);
  window.addEventListener("load", drawPath);
  document.fonts?.ready.then(drawPath);
  drawPath();
  document.addEventListener("astrolearn:journey-loaded", drawPath);
  /* Barra acessível seleciona oito vistas renderizadas do mesmo avatar. */
  const views = [
    "de frente",
    "em três quartos à esquerda",
    "de perfil à esquerda",
    "em três quartos de costas à esquerda",
    "de costas",
    "em três quartos de costas à direita",
    "de perfil à direita",
    "em três quartos à direita",
  ];
  const avatarGhost = document.createElement("div");
  avatarGhost.className = "avatar-render avatar-transition";
  avatarGhost.setAttribute("aria-hidden", "true");
  $("avatarStage").append(avatarGhost);
  let previousView = -1,
    avatarFade = null;
  function rotateAvatar() {
    const angle = Number($("avatarRotation").value),
      index = Math.round(angle / 45) % 8;
    const x = ((index % 4) * 100) / 3,
      y = index < 4 ? 0 : 100;
    if (
      previousView >= 0 &&
      previousView !== index &&
      !reduced() &&
      typeof avatarGhost.animate === "function"
    ) {
      avatarFade?.cancel();
      avatarGhost.style.backgroundPosition =
        $("avatarRender").style.backgroundPosition;
      avatarFade = avatarGhost.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 210,
        easing: "ease-out",
      });
      avatarFade.finished.catch(() => {});
    }
    previousView = index;
    $("avatarRender").style.backgroundPosition = `${x}% ${y}%`;
    $("avatarStage").setAttribute(
      "aria-label",
      `Interagir com seu explorador, visto ${views[index]}`,
    );
    $("avatarRotation").setAttribute(
      "aria-valuetext",
      `${views[index]}, ${angle} graus`,
    );
    $("avatarAngle").textContent = `${angle} graus`;
    document
      .querySelector(".avatar-viewer")
      .classList.toggle("avatar-front", index === 0);
  }
  $("avatarRotation").addEventListener("input", rotateAvatar);
  rotateAvatar();
  /* Chat de orientação local: nunca apresenta respostas pré-programadas como IA. */
  const panel = $("chatPanel"),
    input = $("chatInput"),
    log = $("chatLog");
  let lastChatTrigger = null,
    pending = false;
  function setChat(open) {
    if (open) {
      lastChatTrigger = document.activeElement;
      panel.hidden = false;
      panel.inert = false;
      input.focus();
      stopEntrance();
      document.dispatchEvent(new CustomEvent("astrolearn:help"));
    } else {
      panel.hidden = true;
      panel.inert = true;
      lastChatTrigger?.focus();
    }
    $("helperMascot").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("chat-open", open);
    if (open) cancelFlights();
  }
  $("helperMascot").onclick = () => setChat(panel.hidden);
  $("chatClose").onclick = () => setChat(false);
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setChat(false);
    }
  });
  function appendMessage(text, role) {
    const p = document.createElement("p");
    p.className = `chat-message ${role}`;
    p.textContent = text;
    log.append(p);
    while (log.children.length > 40) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  const answers = {
    mission:
      "Para começar, clique no planeta disponível ou em “Continuar missão”. Leia as instruções e siga o combinado do professor.",
    team: "Ouçam os quatro integrantes e dividam as tarefas: observar, registrar, testar e compartilhar. Vocês podem trocar os papéis para que todo mundo participe.",
    trail:
      "A trilha desce de planeta em planeta. O ✓ marca uma etapa concluída; o cadeado indica uma próxima parada. Clique nos mundos para conhecer a etapa. O progresso vem das atividades da sua turma.",
    investigate:
      "Comece com algo que você observou. Uma boa pergunta permite medir ou comparar: por exemplo, uma planta cresce diferente com mais ou menos luz? Pense em como testar mantendo as outras condições iguais.",
    curiosity:
      "A luz do Sol leva cerca de oito minutos para chegar à Terra. Quando observamos o Sol com equipamento adequado, vemos a luz que saiu dele alguns minutos antes.",
    avatar:
      "A barra “Girar avatar” mostra seu explorador por diferentes ângulos. Nesta prévia são oito vistas renderizadas. A personalização ficará na área de perfil.",
    help: "Posso orientar sobre a missão, a trilha, o avatar e o trabalho em equipe. Sou um assistente demonstrativo com respostas preparadas; ainda não há uma IA conectada.",
    password:
      "Para questões de conta ou senha, volte à tela de login. Nunca envie sua senha pelo chat. A recuperação por e-mail ainda depende da integração da plataforma.",
  };
  function localAnswer(text) {
    const t = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (/senha|conta|login/.test(t)) return answers.password;
    if (/equipe|grupo|cooper|colega/.test(t)) return answers.team;
    if (/avatar|girar|personagem/.test(t)) return answers.avatar;
    if (/curios|universo|sol|espaco/.test(t)) return answers.curiosity;
    if (/pergunta|investig|hipotese|testar/.test(t)) return answers.investigate;
    if (/trilha|bloque|cadeado|planeta/.test(t)) return answers.trail;
    if (/missao|comec|atividade/.test(t)) return answers.mission;
    return answers.help;
  }
  async function sendMessage(text) {
    const clean = text.trim().slice(0, 400);
    if (!clean || pending) return;
    pending = true;
    appendMessage(clean, "user");
    input.value = "";
    try {
      const reply = localAnswer(clean);
      appendMessage(reply, "bot");
    } finally {
      pending = false;
      input.focus();
    }
  }
  $("chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });
  document
    .querySelectorAll("[data-prompt]")
    .forEach((b) => (b.onclick = () => sendMessage(b.dataset.prompt)));
  /* Assistente: entrada única, aceno, decolagem, pequeno tombo e flutuação. */
  const helper = $("helperMascot"),
    sprite = $("helperSprite");
  let entrance = null,
    timers = [],
    walkTimer = null;
  let lastActivity = Date.now(),
    lastIdle = Date.now(),
    idleCount = 0;
  function pose(index, name) {
    sprite.style.backgroundPosition = `${(index % 3) * 50}% ${index < 3 ? 0 : 100}%`;
    helper.dataset.pose = name;
  }
  function stopEntrance() {
    timers.forEach(clearTimeout);
    timers = [];
    if (walkTimer) {
      clearInterval(walkTimer);
      walkTimer = null;
    }
    entrance?.cancel();
    entrance = null;
    pose(3, "hover");
    helper.style.transform = "";
  }
  function later(fn, delay) {
    timers.push(setTimeout(fn, delay));
  }
  function enter() {
    let seen = false;
    try {
      seen = sessionStorage.getItem("astrolearn-helper-intro-v5") === "1";
    } catch {}
    if (
      seen ||
      !planet ||
      reduced() ||
      document.hidden ||
      typeof helper.animate !== "function"
    ) {
      pose(3, "hover");
      return;
    }
    try {
      sessionStorage.setItem("astrolearn-helper-intro-v5", "1");
    } catch {}
    const travel = 110;
    pose(3, "hover");
    entrance = helper.animate(
      [
        { transform: `translate(${travel}px,0) rotate(0deg)`, offset: 0 },
        { transform: "translate(15px,0) rotate(0deg)", offset: 0.38 },
        { transform: "translate(0,0) rotate(0deg)", offset: 0.48 },
        { transform: "translate(0,-55px) rotate(-8deg)", offset: 0.63 },
        { transform: "translate(5,7px) rotate(65deg)", offset: 0.75 },
        { transform: "translate(0,0) rotate(0deg)", offset: 0.87 },
        { transform: "translate(0,0) rotate(0deg)", offset: 1 },
      ],
      { duration: 6500, easing: "ease-in-out" },
    );
    later(() => pose(3, "hover"), 2400);
    later(() => pose(3, "hover"), 3200);
    later(() => pose(3, "hover"), 5600);
    entrance.finished
      .then(() => {
        entrance = null;
        pose(3, "hover");
      })
      .catch(() => {});
  }
  function activity() {
    lastActivity = Date.now();
  }
  ["pointerdown", "keydown", "scroll", "input"].forEach((type) =>
    document.addEventListener(type, activity, { passive: true }),
  );
  setInterval(() => {
    const now = Date.now(),
      busy =
        !panel.hidden ||
        $("dialog").open ||
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if (
      !planet ||
      reduced() ||
      document.hidden ||
      busy ||
      entrance ||
      now - lastActivity < 60000 ||
      now - lastIdle < 90000
    )
      return;
    lastIdle = now;
    idleCount++;
    pose(3, "hover");
    later(() => pose(3, "hover"), 2500);
    if (typeof helper.animate === "function")
      helper.animate(
        idleCount % 2 === 0
          ? [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }]
          : [
              { transform: "translateY(0) scale(1)" },
              { transform: "translateY(-4px) scale(1.04,.97)" },
              { transform: "translateY(0) scale(1)" },
            ],
        { duration: 2200, easing: "ease-in-out" },
      );
  }, 15000);
  function updateMotion() {
    avatarFade?.cancel();
    cancelFlights();
    stopEntrance();
    helper.getAnimations?.().forEach((a) => a.cancel());
  }
  media.addEventListener?.("change", updateMotion);
  document.addEventListener("astrolearn:motion", updateMotion);
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("page-paused", document.hidden);
    if (document.hidden) updateMotion();
    else activity();
  });
  window.addEventListener("pagehide", () => {
    stopEntrance();
    cancelFlights();
  });
  pose(3, "hover");
  window.addEventListener("load", () => later(enter, 650), { once: true });
  /* Pequenas camadas dão vida aos renders sem girar suas construções. */
  let planets = [];
  function initializePlanets() {
    planets = [...document.querySelectorAll(".planet")];
    planets.forEach((planet, i) => {
      ["cloud-layer", "world-glint", ...(i === 0 ? ["waterfall"] : [])].forEach(
        (c) => {
          const layer = document.createElement("span");
          layer.className = c;
          layer.setAttribute("aria-hidden", "true");
          planet.append(layer);
        },
      );
      planet.addEventListener("pointermove", (e) => {
        if (reduced()) return;
        const r = planet.getBoundingClientRect();
        planet.style.setProperty(
          "--tilt",
          `${((e.clientX - r.left - r.width / 2) / r.width) * 8}deg`,
        );
      });
      planet.addEventListener("pointerleave", () =>
        planet.style.setProperty("--tilt", "0deg"),
      );
    });
  }
  document.addEventListener("astrolearn:journey-loaded", initializePlanets);
  initializePlanets();
  let flights = [];
  document.addEventListener("astrolearn:reading", cancelFlights);
  function cancelFlights() {
    flights.forEach((a) => a.cancel());
    flights = [];
  }
  function launch(planet, reveal = false) {
    if (
      !planet ||
      reduced() ||
      document.hidden ||
      document.body.classList.contains("activity-open") ||
      document.body.classList.contains("chat-open")
    )
      return;
    const ship = planet.querySelector(".orbit-ship");
    if (!ship || typeof ship.animate !== "function") return;
    const a = ship.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        {
          transform: "translate(160px,-230px) rotate(25deg)",
          opacity: 1,
          offset: 0.3,
        },
        {
          transform: "translate(400px,-600px) rotate(25deg)",
          opacity: 0,
          offset: 0.42,
        },
        {
          transform: "translate(-100px,-200px) rotate(-20deg)",
          opacity: 0,
          offset: 0.65,
        },
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
      ],
      { duration: reveal ? 4500 : 11000, easing: "ease-in-out" },
    );
    flights.push(a);
    a.finished
      .then(() => (flights = flights.filter((f) => f !== a)))
      .catch(() => {});
  }
  setInterval(() => {
    const i = window.AstroLearnJourney?.getCurrent() ?? 1;
    launch(planets[i]);
  }, 120000);
  document.addEventListener("astrolearn:reveal", (e) => {
    const next = planets[e.detail.current];
    next.classList.add("revealing");
    setTimeout(() => next.classList.remove("revealing"), 2200);
    const old = planets[e.detail.previous],
      ship = old.querySelector(".orbit-ship");
    const orbit = old.querySelector(".active-orbit");
    if (orbit) next.append(orbit);
    if (ship) {
      next.append(ship);
      launch(next, true);
    }
  });
})();

/* Companheiro por imagens renderizadas: reações suaves sem prometer um modelo 3D. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    stage = $("avatarStage"),
    viewer = document.querySelector(".avatar-viewer");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () =>
    motion.matches ||
    document.body.classList.contains("motion-reduced") ||
    document.body.classList.contains("astro-motion-off") ||
    document.hidden;
  let reactionTimer,
    frame = 0,
    targetX = 0,
    targetY = 0,
    x = 0,
    y = 0,
    gesture = null;
  function say(text) {
    clearTimeout(reactionTimer);
    $("avatarReaction").textContent = text;
    $("avatarReaction").classList.add("visible");
    reactionTimer = setTimeout(
      () => $("avatarReaction").classList.remove("visible"),
      3600,
    );
  }
  function react(kind) {
    gesture?.cancel();
    if (reduced() || !stage.animate) return;
    const frames =
      kind === "celebrate"
        ? [
            { transform: "translateY(0) rotate(0)" },
            { transform: "translateY(-14px) rotate(-5deg)" },
            { transform: "translateY(0) rotate(4deg)" },
            { transform: "translateY(-6px) rotate(-2deg)" },
            { transform: "translateY(0) rotate(0)" },
          ]
        : [
            { transform: "translateX(0) rotate(0)", offset: 0 },
            { transform: "translateX(10px) rotate(12deg)", offset: 0.18 },
            { transform: "translateX(-5px) rotate(-7deg)", offset: 0.42 },
            { transform: "translateX(3px) rotate(4deg)", offset: 0.64 },
            { transform: "translateX(-1px) rotate(-1.5deg)", offset: 0.82 },
            { transform: "translateX(0) rotate(0)", offset: 1 },
          ];
    gesture = stage.animate(frames, {
      duration: kind === "celebrate" ? 1150 : 1450,
      easing: "ease-in-out",
    });
    gesture.finished.catch(() => {});
  }
  function track() {
    frame = 0;
    if (reduced()) {
      stage.style.transform = "";
      viewer.style.setProperty("--eye-x", "0px");
      viewer.style.setProperty("--eye-y", "0px");
      return;
    }
    x += (targetX - x) * 0.11;
    y += (targetY - y) * 0.11;
    if (!gesture || gesture.playState !== "running")
      stage.style.transform = `rotate(${x * 1.8}deg) translateY(${y}px)`;
    viewer.style.setProperty("--eye-x", `${x * 1.1}px`);
    viewer.style.setProperty("--eye-y", `${y * 0.7}px`);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.015)
      frame = requestAnimationFrame(track);
  }
  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch" || reduced()) return;
      const r = stage.getBoundingClientRect();
      targetX = Math.max(
        -1,
        Math.min(1, (e.clientX - r.left - r.width / 2) / 300),
      );
      targetY = Math.max(
        -1,
        Math.min(1, (e.clientY - r.top - r.height * 0.3) / 300),
      );
      if (!frame) frame = requestAnimationFrame(track);
    },
    { passive: true },
  );
  stage.addEventListener("click", () => {
    react("balance");
    say("Opa! Equilíbrio recuperado. Vamos explorar!");
  });
  $("avatarRotation").addEventListener("input", () => {
    viewer.style.setProperty("--eye-x", "0px");
    viewer.style.setProperty("--eye-y", "0px");
  });
  document.addEventListener("click", (event) => {
    const p = event.target.closest(".planet");
    if (!p) return;
    glance();
    say(
      p.closest(".step").classList.contains("locked")
        ? "Cada descoberta abre um novo caminho."
        : "Vamos investigar esse mundo!",
    );
  });
  $("continue").addEventListener("click", () => {
    glance();
    say("Uma boa pergunta é o começo de tudo.");
  });
  document.addEventListener("astrolearn:reveal", () => {
    react("celebrate");
    say("Boa descoberta! Um novo mundo espera por você.");
  });
  $("enterTrail").onclick = () => {
    document.getElementById("journey").scrollIntoView({
      behavior: reduced() ? "auto" : "smooth",
      block: "start",
    });
    $("guide").focus({ preventScroll: true });
  };
  // Leve mudança de vista conecta o explorador ao planeta selecionado.
  function glance() {
    if (reduced()) return;
    $("avatarRotation").value = "45";
    $("avatarRotation").dispatchEvent(new Event("input"));
    if (stage.animate)
      stage.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-3deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 900, easing: "ease-in-out" },
      );
  }
  document.addEventListener("astrolearn:help", () => {
    glance();
    say("Vamos descobrir isso juntos!");
  });
  document.addEventListener("astrolearn:answer", () => {
    react("celebrate");
    say("Boa! Você encontrou uma solução.");
  });
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    gesture?.cancel();
    stage.style.transform = "";
    viewer.style.setProperty("--eye-x", "0px");
    viewer.style.setProperty("--eye-y", "0px");
  }
  document.addEventListener("astrolearn:motion", stop);
  motion.addEventListener?.("change", stop);
  document.addEventListener("visibilitychange", stop);
  // Reflexo suave acompanha o cursor apenas nas superfícies de vidro.
  [viewer, document.querySelector(".sidebar")].forEach((el) =>
    el.addEventListener(
      "pointermove",
      (e) => {
        if (reduced()) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          "--glass-x",
          `${((e.clientX - r.left) / r.width) * 100}%`,
        );
        el.style.setProperty(
          "--glass-y",
          `${((e.clientY - r.top) / r.height) * 100}%`,
        );
      },
      { passive: true },
    ),
  );
  document.addEventListener("astrolearn:reveal", () => {
    if (reduced()) return;
    document.querySelector(".path-line").classList.add("path-celebrating");
    setTimeout(
      () =>
        document
          .querySelector(".path-line")
          .classList.remove("path-celebrating"),
      2200,
    );
  });
})();
