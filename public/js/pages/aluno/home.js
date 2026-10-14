/* Inicial do aluno conectada à API, preservando as interações visuais. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const dialog = $("dialog");

  let action = null;
  let trigger = null;

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

    if (trigger && trigger.isConnected) {
      trigger.focus();
    }
  }

  $("closeDialog").onclick = close;

  $("dialogAction").onclick = () => {
    if (action) {
      action();
    } else {
      close();
    }
  };

  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      close();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("activity-open");
  });

  dialog.addEventListener("cancel", () => {
    setTimeout(() => trigger?.focus(), 0);
  });

  // Dados escolares vêm do backend.
  let missions = [];
  let currentStep = -1;
  let dashboard = null;

  // Preserva os planetas e as imagens definidos no HTML.
  const templates = [...document.querySelectorAll(".step")].map((element) =>
    element.cloneNode(true),
  );

  document.querySelector(".steps").replaceChildren();

  $("introMission").textContent = "Carregando suas missões…";
  $("progress").querySelector("strong").textContent = "Carregando…";

  const connection = import("../../services/conexao.js");
  const services = import("../../services/aluno.js");

  function escape(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  }

  function mission(index) {
    const selected = missions[index];

    if (!selected) return;

    if (selected.status_aluno === "bloqueada") {
      open(
        "Mundo desconhecido",
        "<p>Conclua e aguarde a validação da missão anterior para explorar este planeta.</p>",
      );

      return;
    }

    location.assign(
      "atividade.html?atividade=" + encodeURIComponent(selected.id),
    );
  }

  window.AstroLearnJourney = {
    mission,
    getCurrent: () => currentStep,
  };

  async function loadJourney() {
    const connectionService = await connection;

    connectionService.sessaoObrigatoria("aluno");

    const studentService = await services;

    $("continue").disabled = true;

    try {
      dashboard = await studentService.dashboard();

      missions = (dashboard.periodos_trilha || []).flatMap((period) =>
        (period.missoes || []).map((item) => ({
          ...item,
          periodo_nome: period.nome,
          status_aluno:
            period.acessivel === false ? "bloqueada" : item.status_aluno,
        })),
      );

      currentStep = missions.findIndex(
        (item) => item.status_aluno === "disponivel",
      );

      if (currentStep < 0) {
        currentStep = missions.findIndex(
          (item) =>
            item.status_aluno !== "bloqueada" &&
            item.status_aluno !== "concluida",
        );
      }

      const list = document.querySelector(".steps");

      list.replaceChildren();

      const labels = {
        disponivel: "Disponível",
        entregue: "Aguardando correção",
        concluida: "Concluída",
        corrigida_sem_validacao: "Confira a correção",
        bloqueada: "Mundo desconhecido",
      };

      missions.forEach((item, index) => {
        const element =
          templates[index % templates.length].cloneNode(true);

        element.classList.toggle(
          "locked",
          item.status_aluno === "bloqueada",
        );

        element.classList.toggle(
          "done",
          item.status_aluno === "concluida",
        );

        element.classList.toggle("current", index === currentStep);

        element.querySelector(".here")?.remove();

        element.querySelector("h2").textContent =
          item.status_aluno === "bloqueada"
            ? "Mundo desconhecido"
            : item.titulo;

        element.querySelector(".step-number").textContent = index + 1;

        element.querySelector(".step-copy p").textContent =
          item.status_aluno === "bloqueada"
            ? "Uma nova descoberta espera por você."
            : item.periodo_nome +
              " · " +
              (labels[item.status_aluno] || "Confira sua atividade");

        const button = element.querySelector(".planet");

        button.dataset.step = index;

        button.setAttribute(
          "aria-label",
          (labels[item.status_aluno] || "Atividade") +
            ": " +
            (item.status_aluno === "bloqueada"
              ? "próxima missão"
              : item.titulo),
        );

        button.onclick = () => mission(index);

        element.querySelector(".planet-status").textContent =
          item.status_aluno === "concluida"
            ? "✓"
            : item.status_aluno === "bloqueada"
              ? "🔒"
              : item.status_aluno === "entregue"
                ? "⌛"
                : "▶";

        list.append(element);
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
        ? () => {
            if (currentStep >= 0) {
              mission(currentStep);
            } else {
              $("journey").scrollIntoView();
            }
          }
        : join;

      $("continue").disabled = false;

      if (!missions.length) {
        const element = document.createElement("li");

        element.textContent = dashboard.tem_sala
          ? "Seu professor ainda não disponibilizou missões."
          : "Entre em uma turma para iniciar sua expedição.";

        list.append(element);
      }

      document.dispatchEvent(
        new CustomEvent("astrolearn:journey-loaded"),
      );
    } catch (error) {
      $("introMission").textContent = error.message;
      $("continue").textContent = "Tentar novamente";
      $("continue").onclick = loadJourney;
      $("continue").disabled = false;
    }
  }

  function join() {
    open(
      "Entre na sua turma",
      '<label for="classCode">Código fornecido pelo professor</label>' +
        '<input id="classCode" autocomplete="off" maxlength="30">' +
        '<p id="classStatus" role="status"></p>',
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
        } catch (error) {
          const status = $("classStatus");

          if (status) {
            status.textContent = error.message;
          }
        } finally {
          $("dialogAction").disabled = false;
        }
      },
    );
  }

  $("guide").onclick = () =>
    open(
      "Como funciona sua expedição?",
      "<ol>" +
        "<li>Abra a missão disponível.</li>" +
        "<li>Leia as instruções do professor.</li>" +
        "<li>Realize a atividade.</li>" +
        "<li>Aguarde a correção para liberar a próxima etapa.</li>" +
        "</ol>",
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
      "<p>Consulte o retorno do professor dentro de cada atividade. " +
        "Notificações ainda dependem de uma função no backend.</p>",
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
      "Minha equipe",
      "Consulte os integrantes da equipe cadastrada pelo professor.",
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
      "O perfil reúne seus dados e preferências.",
    ],
  };

  function reducedMotion() {
    return (
      document.body.classList.contains("motion-reduced") ||
      document.body.classList.contains("astro-motion-off") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const destination = button.dataset.nav;

      const pages = {
        user: "perfil.html",
        shop: "loja.html",
        team: "equipe.html",
        book: "biblioteca.html",
        star: "conquistas.html",
      };

      if (pages[destination]) {
        window.location.assign(pages[destination]);
        return;
      }

      if (destination === "home") {
        window.scrollTo({
          top: 0,
          behavior: reducedMotion() ? "auto" : "smooth",
        });

        return;
      }

      if (destination === "trail") {
        $("journey").scrollIntoView({
          behavior: reducedMotion() ? "auto" : "smooth",
          block: "start",
        });

        $("guide").focus({ preventScroll: true });
        return;
      }

      const section = sections[destination];

      if (section) {
        open(
          section[0],
          `<p>${section[1]}</p>`,
          "NAVEGAÇÃO",
        );
      }
    });
  });

  // Descoberta opcional no cenário.
  const beacon = document.createElement("button");

  beacon.id = "sceneDiscovery";
  beacon.className = "scene-discovery";

  beacon.setAttribute(
    "aria-label",
    "Explorar satélite: desafio de robótica",
  );

  beacon.innerHTML =
    document.querySelector(".satellite").innerHTML +
    '<span class="scene-tip">Um sinal curioso…</span>';

  document.body.append(beacon);

  beacon.onclick = () => {
    open(
      "Um rover precisa de você!",
      '<p>Um robô explora um planeta com atmosfera, onde o som pode ' +
        "se propagar, e precisa perceber uma rocha à sua frente. " +
        "Qual equipamento ajudaria a medir a distância até o obstáculo?</p>" +
        '<button class="answer" data-sensor="light">Uma lâmpada para iluminar</button>' +
        '<button class="answer" data-sensor="distance">Um sensor ultrassônico de distância</button>' +
        '<button class="answer" data-sensor="sound">Um alto-falante para emitir música</button>' +
        '<p id="sensorFeedback" role="status" aria-live="polite"></p>',
      "SINAL DO SATÉLITE",
      "Voltar à expedição",
    );

    dialog.querySelectorAll("[data-sensor]").forEach((button) => {
      button.onclick = () => {
        const right = button.dataset.sensor === "distance";

        $("sensorFeedback").textContent = right
          ? "Isso! Em um ambiente com ar, o sensor emite um pulso sonoro " +
            "e mede o tempo do eco para estimar a distância. No vácuo do " +
            "espaço, o som não se propaga: usaríamos outra tecnologia, como lidar."
          : "Esse equipamento não mede a distância. Procure uma opção " +
            "que detecta a proximidade de um obstáculo.";

        if (right) {
          dialog.querySelectorAll("[data-sensor]").forEach((answer) => {
            answer.disabled = true;
          });

          beacon.classList.add("discovered");

          beacon.setAttribute(
            "aria-label",
            "Rever descoberta do satélite",
          );

          document.dispatchEvent(new CustomEvent("astrolearn:answer"));
        }
      };
    });
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

  document.querySelectorAll(".step").forEach((step, index) => {
    const button = document.createElement("button");

    button.className = "discovery";

    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="m4 9 12-5 3 6-12 5Zm8 4-4 8m4-8 5 8m-5-8v8"/>' +
      "</svg>";

    button.setAttribute(
      "aria-label",
      "Explorar uma descoberta deste mundo",
    );

    button.onclick = () => {
      if (step.classList.contains("locked")) {
        window.AstroLearnJourney.mission(index);
        return;
      }

      const discovery = discoveries[index % discoveries.length];

      open(
        discovery[0],
        `<p>${discovery[1]}</p>`,
        "PEQUENA DESCOBERTA",
      );
    };

    step.append(button);

    const preview = document.createElement("div");

    preview.className = "mission-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.textContent = "Consulte as orientações da sua atividade.";

    step.append(preview);
  });
})();

/* Avatar por vistas renderizadas e assistente de orientação local. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const media = matchMedia("(prefers-reduced-motion: reduce)");

  const reduced = () =>
    media.matches ||
    document.body.classList.contains("motion-reduced") ||
    document.body.classList.contains("astro-motion-off");

  // Desenha a curva entre os planetas.
  function drawPath() {
    const wrap = document.querySelector(".path-wrap");
    const box = wrap.getBoundingClientRect();

    const points = [...document.querySelectorAll(".planet")].map(
      (planet) => {
        const rect = planet.getBoundingClientRect();

        return {
          x: rect.left - box.left + rect.width / 2,
          y: rect.top - box.top + rect.height / 2,
        };
      },
    );

    if (!points.length) return;

    let path = `M${points[0].x},${points[0].y}`;

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const next = points[index];
      const middle = (previous.y + next.y) / 2;

      path +=
        ` C${previous.x},${middle}` +
        ` ${next.x},${middle}` +
        ` ${next.x},${next.y}`;
    }

    $("pathCurve").setAttribute("d", path);
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(drawPath).observe(
      document.querySelector(".path-wrap"),
    );
  }

  window.addEventListener("resize", drawPath);
  window.addEventListener("load", drawPath);

  document.fonts?.ready.then(drawPath);

  drawPath();

  document.addEventListener("astrolearn:journey-loaded", drawPath);

  // Barra de visualização do avatar.
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

  let previousView = -1;
  let avatarFade = null;

  function rotateAvatar() {
    const angle = Number($("avatarRotation").value);
    const index = Math.round(angle / 45) % 8;

    const x = ((index % 4) * 100) / 3;
    const y = index < 4 ? 0 : 100;

    if (
      previousView >= 0 &&
      previousView !== index &&
      !reduced() &&
      typeof avatarGhost.animate === "function"
    ) {
      avatarFade?.cancel();

      avatarGhost.style.backgroundPosition =
        $("avatarRender").style.backgroundPosition;

      avatarFade = avatarGhost.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: 210,
          easing: "ease-out",
        },
      );

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

  // Chat local com respostas preparadas.
  const panel = $("chatPanel");
  const input = $("chatInput");
  const log = $("chatLog");

  let lastChatTrigger = null;
  let pending = false;

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

    if (open) {
      cancelFlights();
    }
  }

  $("helperMascot").onclick = () => setChat(panel.hidden);
  $("chatClose").onclick = () => setChat(false);

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setChat(false);
    }
  });

  function appendMessage(text, role) {
    const paragraph = document.createElement("p");

    paragraph.className = `chat-message ${role}`;
    paragraph.textContent = text;

    log.append(paragraph);

    while (log.children.length > 40) {
      log.firstElementChild.remove();
    }

    log.scrollTop = log.scrollHeight;
  }

  const answers = {
    mission:
      "Para começar, clique no planeta disponível ou em “Continuar missão”. Leia as instruções e siga o combinado do professor.",
    team:
      "Ouçam os integrantes e dividam as tarefas: observar, registrar, testar e compartilhar. Vocês podem trocar os papéis para que todo mundo participe.",
    trail:
      "A trilha desce de planeta em planeta. O ✓ marca uma etapa concluída; o cadeado indica uma próxima parada. Clique nos mundos para conhecer a etapa. O progresso vem das atividades da sua turma.",
    investigate:
      "Comece com algo que você observou. Uma boa pergunta permite medir ou comparar: por exemplo, uma planta cresce diferente com mais ou menos luz? Pense em como testar mantendo as outras condições iguais.",
    curiosity:
      "A luz do Sol leva cerca de oito minutos para chegar à Terra. Quando observamos o Sol com equipamento adequado, vemos a luz que saiu dele alguns minutos antes.",
    avatar:
      "A barra “Girar avatar” mostra seu explorador por diferentes ângulos. São oito vistas renderizadas. A personalização local está na loja.",
    help:
      "Posso orientar sobre a missão, a trilha, o avatar e o trabalho em equipe. Sou um assistente demonstrativo com respostas preparadas; ainda não há uma IA conectada.",
    password:
      "Para questões de conta ou senha, volte à tela de login. Nunca envie sua senha pelo chat. A recuperação por e-mail ainda depende da integração da plataforma.",
  };

  function localAnswer(text) {
    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (/senha|conta|login/.test(normalized)) {
      return answers.password;
    }

    if (/equipe|grupo|cooper|colega/.test(normalized)) {
      return answers.team;
    }

    if (/avatar|girar|personagem/.test(normalized)) {
      return answers.avatar;
    }

    if (/curios|universo|sol|espaco/.test(normalized)) {
      return answers.curiosity;
    }

    if (/pergunta|investig|hipotese|testar/.test(normalized)) {
      return answers.investigate;
    }

    if (/trilha|bloque|cadeado|planeta/.test(normalized)) {
      return answers.trail;
    }

    if (/missao|comec|atividade/.test(normalized)) {
      return answers.mission;
    }

    return answers.help;
  }

  async function sendMessage(text) {
    const clean = text.trim().slice(0, 400);

    if (!clean || pending) return;

    pending = true;

    appendMessage(clean, "user");

    input.value = "";

    try {
      appendMessage(localAnswer(clean), "bot");
    } finally {
      pending = false;
      input.focus();
    }
  }

  $("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.onclick = () => sendMessage(button.dataset.prompt);
  });

  // Entrada e movimentos do assistente.
  const helper = $("helperMascot");
  const sprite = $("helperSprite");

  let entrance = null;
  let timers = [];
  let walkTimer = null;

  let lastActivity = Date.now();
  let lastIdle = Date.now();
  let idleCount = 0;

  function pose(index, name) {
    sprite.style.backgroundPosition =
      `${(index % 3) * 50}% ${index < 3 ? 0 : 100}%`;

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

  function later(callback, delay) {
    timers.push(setTimeout(callback, delay));
  }

  function enter() {
    let seen = false;

    try {
      seen =
        sessionStorage.getItem("astrolearn-helper-intro-v5") === "1";
    } catch {}

    // Aqui não existe variável planet: a condição foi corrigida.
    if (
      seen ||
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
        {
          transform: `translate(${travel}px,0) rotate(0deg)`,
          offset: 0,
        },
        {
          transform: "translate(15px,0) rotate(0deg)",
          offset: 0.38,
        },
        {
          transform: "translate(0,0) rotate(0deg)",
          offset: 0.48,
        },
        {
          transform: "translate(0,-55px) rotate(-8deg)",
          offset: 0.63,
        },
        {
          transform: "translate(5,7px) rotate(65deg)",
          offset: 0.75,
        },
        {
          transform: "translate(0,0) rotate(0deg)",
          offset: 0.87,
        },
        {
          transform: "translate(0,0) rotate(0deg)",
          offset: 1,
        },
      ],
      {
        duration: 6500,
        easing: "ease-in-out",
      },
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

  ["pointerdown", "keydown", "scroll", "input"].forEach((type) => {
    document.addEventListener(type, activity, { passive: true });
  });

  setInterval(() => {
    const now = Date.now();

    const busy =
      !panel.hidden ||
      $("dialog").open ||
      ["INPUT", "TEXTAREA"].includes(
        document.activeElement?.tagName,
      );

    // Aqui também não existe variável planet.
    if (
      reduced() ||
      document.hidden ||
      busy ||
      entrance ||
      now - lastActivity < 60000 ||
      now - lastIdle < 90000
    ) {
      return;
    }

    lastIdle = now;
    idleCount++;

    pose(3, "hover");

    later(() => pose(3, "hover"), 2500);

    if (typeof helper.animate === "function") {
      helper.animate(
        idleCount % 2 === 0
          ? [
              { transform: "rotate(0deg)" },
              { transform: "rotate(360deg)" },
            ]
          : [
              { transform: "translateY(0) scale(1)" },
              { transform: "translateY(-4px) scale(1.04,.97)" },
              { transform: "translateY(0) scale(1)" },
            ],
        {
          duration: 2200,
          easing: "ease-in-out",
        },
      );
    }
  }, 15000);

  function updateMotion() {
    avatarFade?.cancel();

    cancelFlights();
    stopEntrance();

    helper.getAnimations?.().forEach((animation) => {
      animation.cancel();
    });
  }

  media.addEventListener?.("change", updateMotion);

  document.addEventListener("astrolearn:motion", updateMotion);

  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("page-paused", document.hidden);

    if (document.hidden) {
      updateMotion();
    } else {
      activity();
    }
  });

  window.addEventListener("pagehide", () => {
    stopEntrance();
    cancelFlights();
  });

  pose(3, "hover");

  window.addEventListener(
    "load",
    () => later(enter, 650),
    { once: true },
  );

  // Camadas animadas dos planetas.
  let planets = [];

  function initializePlanets() {
    planets = [...document.querySelectorAll(".planet")];

    planets.forEach((planet, index) => {
      [
        "cloud-layer",
        "world-glint",
        ...(index === 0 ? ["waterfall"] : []),
      ].forEach((className) => {
        const layer = document.createElement("span");

        layer.className = className;
        layer.setAttribute("aria-hidden", "true");

        planet.append(layer);
      });

      planet.addEventListener("pointermove", (event) => {
        if (reduced()) return;

        const rect = planet.getBoundingClientRect();

        planet.style.setProperty(
          "--tilt",
          `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 8}deg`,
        );
      });

      planet.addEventListener("pointerleave", () => {
        planet.style.setProperty("--tilt", "0deg");
      });
    });
  }

  document.addEventListener(
    "astrolearn:journey-loaded",
    initializePlanets,
  );

  initializePlanets();

  let flights = [];

  document.addEventListener("astrolearn:reading", cancelFlights);

  function cancelFlights() {
    flights.forEach((animation) => animation.cancel());
    flights = [];
  }

  function launch(planet, reveal = false) {
    // Nesta função planet existe, pois é recebido como parâmetro.
    if (
      !planet ||
      reduced() ||
      document.hidden ||
      document.body.classList.contains("activity-open") ||
      document.body.classList.contains("chat-open")
    ) {
      return;
    }

    const ship = planet.querySelector(".orbit-ship");

    if (!ship || typeof ship.animate !== "function") return;

    const animation = ship.animate(
      [
        {
          transform: "translate(0,0) rotate(0)",
          opacity: 1,
        },
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
        {
          transform: "translate(0,0) rotate(0)",
          opacity: 1,
        },
      ],
      {
        duration: reveal ? 4500 : 11000,
        easing: "ease-in-out",
      },
    );

    flights.push(animation);

    animation.finished
      .then(() => {
        flights = flights.filter((item) => item !== animation);
      })
      .catch(() => {});
  }

  setInterval(() => {
    const index = window.AstroLearnJourney?.getCurrent() ?? 1;

    launch(planets[index]);
  }, 120000);

  document.addEventListener("astrolearn:reveal", (event) => {
    const next = planets[event.detail.current];

    if (!next) return;

    next.classList.add("revealing");

    setTimeout(() => {
      next.classList.remove("revealing");
    }, 2200);

    const previous = planets[event.detail.previous];

    if (!previous) return;

    const ship = previous.querySelector(".orbit-ship");
    const orbit = previous.querySelector(".active-orbit");

    if (orbit) {
      next.append(orbit);
    }

    if (ship) {
      next.append(ship);
      launch(next, true);
    }
  });
})();

/* Reações do avatar e reflexos nas superfícies de vidro. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const stage = $("avatarStage");
  const viewer = document.querySelector(".avatar-viewer");

  const motion = matchMedia("(prefers-reduced-motion: reduce)");

  const reduced = () =>
    motion.matches ||
    document.body.classList.contains("motion-reduced") ||
    document.body.classList.contains("astro-motion-off") ||
    document.hidden;

  let reactionTimer;
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let gesture = null;

  function say(text) {
    clearTimeout(reactionTimer);

    $("avatarReaction").textContent = text;
    $("avatarReaction").classList.add("visible");

    reactionTimer = setTimeout(() => {
      $("avatarReaction").classList.remove("visible");
    }, 3600);
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
            {
              transform: "translateX(0) rotate(0)",
              offset: 0,
            },
            {
              transform: "translateX(10px) rotate(12deg)",
              offset: 0.18,
            },
            {
              transform: "translateX(-5px) rotate(-7deg)",
              offset: 0.42,
            },
            {
              transform: "translateX(3px) rotate(4deg)",
              offset: 0.64,
            },
            {
              transform: "translateX(-1px) rotate(-1.5deg)",
              offset: 0.82,
            },
            {
              transform: "translateX(0) rotate(0)",
              offset: 1,
            },
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

    if (!gesture || gesture.playState !== "running") {
      stage.style.transform =
        `rotate(${x * 1.8}deg) translateY(${y}px)`;
    }

    viewer.style.setProperty("--eye-x", `${x * 1.1}px`);
    viewer.style.setProperty("--eye-y", `${y * 0.7}px`);

    if (
      Math.abs(targetX - x) + Math.abs(targetY - y) > 0.015
    ) {
      frame = requestAnimationFrame(track);
    }
  }

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || reduced()) return;

      const rect = stage.getBoundingClientRect();

      targetX = Math.max(
        -1,
        Math.min(
          1,
          (event.clientX - rect.left - rect.width / 2) / 300,
        ),
      );

      targetY = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - rect.top - rect.height * 0.3) / 300,
        ),
      );

      if (!frame) {
        frame = requestAnimationFrame(track);
      }
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
    const planet = event.target.closest(".planet");

    if (!planet) return;

    glance();

    say(
      planet.closest(".step").classList.contains("locked")
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
    $("journey").scrollIntoView({
      behavior: reduced() ? "auto" : "smooth",
      block: "start",
    });

    $("guide").focus({ preventScroll: true });
  };

  function glance() {
    if (reduced()) return;

    $("avatarRotation").value = "45";
    $("avatarRotation").dispatchEvent(new Event("input"));

    if (stage.animate) {
      stage.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-3deg)" },
          { transform: "rotate(0deg)" },
        ],
        {
          duration: 900,
          easing: "ease-in-out",
        },
      );
    }
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

  // Reflexo acompanha o cursor nas superfícies de vidro.
  [viewer, document.querySelector(".sidebar")].forEach((element) => {
    element.addEventListener(
      "pointermove",
      (event) => {
        if (reduced()) return;

        const rect = element.getBoundingClientRect();

        element.style.setProperty(
          "--glass-x",
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );

        element.style.setProperty(
          "--glass-y",
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
      },
      { passive: true },
    );
  });

  document.addEventListener("astrolearn:reveal", () => {
    if (reduced()) return;

    document
      .querySelector(".path-line")
      .classList.add("path-celebrating");

    setTimeout(() => {
      document
        .querySelector(".path-line")
        .classList.remove("path-celebrating");
    }, 2200);
  });
})();