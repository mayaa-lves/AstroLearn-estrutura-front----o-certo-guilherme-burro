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
  const names = [
    "Primeiro contato",
    "Órbita das ideias",
    "Laboratório lunar",
    "Engenharia em Marte",
    "Constelação criativa",
  ];
  let currentStep = 1;
  const steps = [...document.querySelectorAll(".step")];
  const descriptions = [
    "Explore o universo da ciência e do seu potencial.",
    "Observe, faça perguntas e investigue.",
    "Experimente, crie e teste suas hipóteses.",
    "Construa soluções para grandes desafios.",
    "Una ciência, arte e tecnologia para imaginar novos futuros.",
  ];
  function refresh() {
    steps.forEach((s, i) => {
      s.classList.toggle("locked", i > currentStep);
      s.classList.toggle("current", i === currentStep);
      s.classList.toggle("done", i < currentStep);
      s.querySelector("h2").textContent =
        i > currentStep ? "Mundo desconhecido" : names[i];
      s.querySelector(".step-copy p").textContent =
        i > currentStep
          ? "Uma nova descoberta espera por você."
          : descriptions[i];
      s.querySelector(".planet").setAttribute(
        "aria-label",
        i > currentStep
          ? `Etapa ${i + 1}: mundo desconhecido, bloqueado`
          : `${names[i]}: ${i < currentStep ? "concluída" : "missão atual"}`,
      );
      s.querySelector(".here")?.remove();
      if (i === currentStep) {
        const badge = document.createElement("span");
        badge.className = "here";
        badge.textContent = "⌖ VOCÊ ESTÁ AQUI";
        s.querySelector(".step-copy").prepend(badge);
      }
      const status = s.querySelector(".planet-status");
      if (i <= currentStep) status.textContent = i < currentStep ? "✓" : "▶";
    });
  }
  function complete() {
    close();
    const previous = currentStep;
    currentStep = 2;
    refresh();
    $("progress").querySelector("strong").textContent = "180 XP";
    document.dispatchEvent(
      new CustomEvent("astrolearn:reveal", {
        detail: { previous, current: currentStep },
      }),
    );
    $("introMission").textContent = names[currentStep];
    document.querySelector(".intro-detail span").textContent =
      "Individual · 15 min";
  }
  refresh();
  window.AstroLearnJourney = { mission, getCurrent: () => currentStep };
  function mission(i) {
    if (i <= currentStep) {
      window.location.assign(`atividade.html?missao=${i}`);
      return;
    }
    if (i > currentStep) {
      open(
        "Mundo desconhecido",
        "<p>Esta é uma próxima parada da sua expedição. Conclua a missão anterior para chegar até aqui.</p><p>Na plataforma conectada, o professor define a sequência das atividades.</p>",
        "PRÓXIMA PARADA",
      );
      return;
    }
    if (i === 2) {
      open(
        names[i],
        "<p><strong>Objetivo:</strong> planejar um experimento com luz e plantas.</p><p>Registre sua hipótese, escolha o que vai medir e mantenha água, solo e tempo iguais.</p><p>Individual · 15 minutos. Esta atividade é uma demonstração.</p>",
        "MISSÃO 03",
      );
      return;
    }
    if (i === 0) {
      open(
        names[i],
        "<p>Primeira etapa concluída nesta demonstração: conhecer a missão e aprender a observar.</p><p>Vocês vão observar, investigar, construir e compartilhar o que aprenderem.</p>",
        "REVISAR DESCOBERTA",
      );
      return;
    }
    open(
      "Órbita das ideias",
      "<p><strong>Objetivo:</strong> transformar uma observação em uma pergunta que possa ser investigada.</p><ol><li>Observe algo ao seu redor.</li><li>Escreva uma pergunta sobre sua observação.</li><li>Pense em como testar a pergunta e comparar resultados.</li></ol><p>Tempo sugerido: 10 minutos · Individual · Ciência</p>",
      "MISSÃO 02",
      "Experimentar uma pergunta",
      quiz,
    );
  }
  function quiz() {
    $("dialogTitle").textContent = "Qual pergunta dá para investigar?";
    $("dialogKicker").textContent = "EXPERIMENTO DA PRÉVIA";
    $("dialogContent").innerHTML =
      '<p>Escolha a pergunta que permite comparar resultados:</p><button class="answer" data-answer="no">Qual é a planta mais bonita do universo?</button><button class="answer" data-answer="yes">Uma planta cresce diferente com mais ou menos luz?</button><p id="answerFeedback" role="status"></p>';
    $("dialogAction").textContent = "Voltar para a jornada";
    action = close;
    dialog.querySelectorAll(".answer").forEach(
      (b) =>
        (b.onclick = () => {
          const right = b.dataset.answer === "yes";
          $("answerFeedback").className = "feedback";
          $("answerFeedback").textContent = right
            ? "Boa descoberta! Você pode comparar plantas, manter as outras condições iguais e observar os resultados."
            : "Essa pergunta depende de opinião. Tente escolher uma pergunta que permita medir ou comparar algo.";
          if (right) {
            document.dispatchEvent(new CustomEvent("astrolearn:answer"));
            dialog
              .querySelectorAll(".answer")
              .forEach((a) => (a.disabled = true));
            $("dialogAction").textContent =
              "Concluir e descobrir o próximo mundo";
            action = complete;
          }
        }),
    );
  }
  document
    .querySelectorAll("[data-step]")
    .forEach((b) => (b.onclick = () => mission(Number(b.dataset.step))));
  $("continue").onclick = () => mission(currentStep);
  $("guide").onclick = () =>
    open(
      "Como funciona sua expedição?",
      "<ol><li>Comece pelo planeta marcado “Você está aqui”.</li><li>Leia o objetivo e veja se a atividade é individual ou em equipe.</li><li>Faça a atividade e compartilhe sua descoberta.</li><li>Avance quando a etapa estiver concluída.</li></ol><p>✓ significa concluído. O símbolo de bloqueio indica uma etapa futura. Nesta prévia, o progresso é demonstrativo.</p>",
      "GUIA DA MISSÃO",
    );
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

  $("progress").onclick = () =>
    open(
      "Sua jornada até aqui",
      `<p><strong>${currentStep === 1 ? 120 : 180} XP · ${currentStep} de 5 missões concluídas.</strong></p><p>Progresso demonstrativo desta visita, sem registro escolar.</p>`,
      "SEU PROGRESSO",
    );

  $("notifications").onclick = () =>
    open(
      "Transmissão do professor",
      "<p>Na próxima atividade, tragam uma pergunta sobre algo que vocês observam no dia a dia.</p><p>Este aviso é um exemplo de como as orientações vão aparecer para o aluno.</p>",
      "AVISO DE EXEMPLO",
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
      "Para começar, clique no planeta marcado “Você está aqui” ou em “Continuar missão”. Leia as instruções: cada atividade informa se é individual ou em equipe.",
    team: "Ouçam os quatro integrantes e dividam as tarefas: observar, registrar, testar e compartilhar. Vocês podem trocar os papéis para que todo mundo participe.",
    trail:
      "A trilha desce de planeta em planeta. O ✓ marca uma etapa concluída; o cadeado indica uma próxima parada. Clique nos mundos para conhecer a etapa. O progresso desta tela é demonstrativo.",
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
  const planets = [...document.querySelectorAll(".planet")];
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
  let flights = [];
  document.addEventListener("astrolearn:reading", cancelFlights);
  function cancelFlights() {
    flights.forEach((a) => a.cancel());
    flights = [];
  }
  function launch(planet, reveal = false) {
    if (
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
  document.querySelectorAll(".planet").forEach((p) =>
    p.addEventListener("click", () => {
      glance();
      say(
        p.closest(".step").classList.contains("locked")
          ? "Cada descoberta abre um novo caminho."
          : "Vamos investigar esse mundo!",
      );
    }),
  );
  $("continue").addEventListener("click", () => {
    glance();
    say("Uma boa pergunta é o começo de tudo.");
  });
  document.addEventListener("astrolearn:reveal", () => {
    react("celebrate");
    say("Boa descoberta! Um novo mundo espera por você.");
  });
  $("enterTrail").onclick = () => {
    document
      .getElementById("journey")
      .scrollIntoView({
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
