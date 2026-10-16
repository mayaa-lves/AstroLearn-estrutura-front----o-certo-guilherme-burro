/* Comportamentos visuais compartilhados; nenhuma nota, moeda ou permissão é inventada. */
const assets = new URL("../../assets/", import.meta.url);
const teacher = location.pathname.includes("/professor/");
const page = location.pathname.split("/").pop().replace(".html", "") || "home";
document.body.dataset.spacePage = page;
document.body.dataset.spaceRole = teacher ? "professor" : "aluno";

const paths = {
  home: "M3 10 12 3l9 7v10h-6v-6H9v6H3Z",
  room: "M3 5h18v16H3ZM7 9h3m4 0h3M7 14h3m4 0h3",
  trail:
    "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 9v3a3 3 0 0 0 3 3h6",
  library: "M12 5C8 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v16",
  award: "M8 3h8l3 6-7 5-7-5Zm0 10-2 8 6-3 6 3-2-8",
  shop: "M3 9h18l-2-6H5Zm1 0v12h16V9M9 21v-7h6v7",
  team: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a4 4 0 0 1 0 8m2 2a6 6 0 0 1 3 5v2",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2",
  game: "M5 7h14l3 10-3 3-5-4h-4l-5 4-3-3ZM7 10v6m-3-3h6m6-2h1m1 3h1",
  chat: "M4 4h16v12H9l-5 4Zm4 5h8m-8 4h5",
  activity: "M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5",
  correct: "M8 3H4v18h16V3h-4M8 2h8v4H8Zm0 11 3 3 5-6",
  bell: "M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4",
  view: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm7 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
  edit: "m15 3 6 6-12 12H3v-6ZM12 6l6 6",
  delete: "M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  archive: "M3 3h18v5H3Zm2 5v13h14V8M9 12h6",
  exit: "M9 4H4v16h5m5-12 4 4-4 4m-5-4h12",
};
function svg(name) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  node.setAttribute("viewBox", "0 0 24 24");
  node.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(node.namespaceURI, "path");
  path.setAttribute("d", paths[name] || paths.home);
  node.append(path);
  return node;
}
const room = new URLSearchParams(location.search).get("sala");
const nav = document.querySelector(".sidebar nav");
const base = location.pathname.includes("/aluno/jogos/") ? "../" : "";
function teacherLibraryMenu() {
  if (!teacher || !["biblioteca", "novo-material"].includes(page) || !nav) return;
  const entries = [["home.html", "Turmas", "room"]];
  if (room)
    entries.push(
      ["turma.html", "Sala", "home"],
      ["atividades.html", "Atividades", "activity"],
      ["biblioteca.html", "Biblioteca", "library"],
      ["equipes.html", "Equipes", "team"],
      ["correcoes.html", "Correções", "correct"],
      ["perguntas.html", "Perguntas", "chat"],
    );
  entries.push(["notificacoes.html", "Notificações", "bell"]);
  nav.replaceChildren(
    ...entries.map(([file, label, icon]) => {
      const a = document.createElement("a");
      a.href =
        file + (room && file !== "home.html" ? "?sala=" + encodeURIComponent(room) : "");
      a.setAttribute("aria-label", label);
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      a.append(svg(icon), span);
      if (file === page + ".html" || (page === "novo-material" && icon === "library")) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
      }
      return a;
    }),
  );
}
teacherLibraryMenu();
function polishNavigation() {
  if (!nav) return;
  for (const a of nav.querySelectorAll("a, button")) {
    if (a.dataset.polished) continue;
    const label =
      a.getAttribute("aria-label") ||
      a.querySelector(".label")?.textContent ||
      a.textContent.trim();
    if (label === "Configurações") {
      a.remove();
      continue;
    }
    const keys = {
      Início: "home",
      "Minha trilha": "trail",
      Turmas: "room",
      Sala: "home",
      Atividades: "activity",
      Biblioteca: "library",
      Conquistas: "award",
      Loja: "shop",
      "Minha equipe": "team",
      Equipes: "team",
      Perfil: "profile",
      Jogos: "game",
      Assistente: "chat",
      Perguntas: "chat",
      Correções: "correct",
      Notificações: "bell",
      Sair: "exit",
    };
    const icon = keys[label];
    if (icon) {
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      a.replaceChildren(svg(icon), span);
      a.setAttribute("aria-label", label);
      a.title = label;
    }
    if (teacher && room && label === "Notificações")
      a.href = "notificacoes.html?sala=" + encodeURIComponent(room);
    a.dataset.polished = "1";
  }
}
if (!teacher && nav) {
  const exit = [...document.querySelectorAll(".sidebar a")].find((a) =>
    a.href.includes("/auth/login.html"),
  );
  if (exit && !nav.contains(exit)) {
    exit.className = "nav-item";
    exit.textContent = "Sair";
    nav.append(exit);
  }
}
polishNavigation();
if (page === "assistente" && nav) {
  nav.querySelectorAll("a").forEach((a) => {
    const current = a.getAttribute("aria-label") === "Assistente";
    a.classList.toggle("active", current);
    if (current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
if (nav) new MutationObserver(polishNavigation).observe(nav, { childList: true });
for (const a of document.querySelectorAll('a[href*="configuracoes.html"]'))
  a.href = base + "perfil.html#preferencesTitle";

// Um retorno contextual previsível mantém a turma e o período selecionados.
if (teacher && room && page !== "home") {
  const back = document.createElement("a");
  back.className = "context-back";
  const file =
    page === "novo-material"
      ? "biblioteca.html"
      : ["editor-atividade", "atividade"].includes(page)
        ? "atividades.html"
        : "turma.html";
  const query = new URLSearchParams({ sala: room });
  const period = new URLSearchParams(location.search).get("periodo");
  if (period) query.set("periodo", period);
  back.href = file + "?" + query;
  back.append(
    svg("trail"),
    document.createTextNode(
      file === "biblioteca.html"
        ? "Voltar à biblioteca"
        : file === "atividades.html"
          ? "Voltar às atividades"
          : "Voltar à turma",
    ),
  );
  document.querySelector(".breadcrumbs")?.after(back);
}

// Cartões docentes: capa estável por ID; ações em ícones com rótulos para teclado e leitor de tela.
const materialList = document.getElementById("materialList");
function polishMaterials() {
  if (!materialList) return;
  for (const card of materialList.querySelectorAll(":scope > article")) {
    if (!card.querySelector(".material-cover")) {
      const cover = document.createElement("div");
      cover.className = "material-cover";
      cover.setAttribute("aria-hidden", "true");
      const edit = [...card.querySelectorAll("a")].find((a) =>
        a.href.includes("material="),
      );
      cover.dataset.world = String(
        [...(edit?.search || card.querySelector("h3")?.textContent || "")].reduce(
          (n, c) => n + c.charCodeAt(0),
          0,
        ) % 5,
      );
      card.prepend(cover);
    }
    for (const button of card.querySelectorAll("button, a")) {
      if (button.dataset.iconReady) continue;
      const label = button.textContent.trim();
      const icon = /visualizar|ver como/i.test(label)
        ? "view"
        : /^editar/i.test(label)
          ? "edit"
          : /excluir|apagar/i.test(label)
            ? "delete"
            : /arquivar/i.test(label)
              ? "archive"
              : null;
      if (!icon) continue;
      button.setAttribute("aria-label", label);
      button.title = label;
      button.replaceChildren(svg(icon));
      button.classList.add("icon-button");
      if (icon === "delete") button.classList.add("danger");
      button.dataset.iconReady = "1";
      button.parentElement.classList.add("material-actions");
    }
  }
}
polishMaterials();
if (materialList)
  new MutationObserver(polishMaterials).observe(materialList, { childList: true });

// A ajuda rápida tem uma página própria; não simula uma IA nem envia perguntas ao professor.
const chatPanel = document.getElementById("chatPanel");
if (chatPanel) {
  const a = document.createElement("a");
  a.href = "assistente.html";
  a.textContent = "Abrir central de ajuda ↗";
  a.style.cssText = "display:block;padding:8px 18px;font-size:12px;text-align:center";
  chatPanel.append(a);
}

// Fundo em canvas único: partículas discretas, física suave, sem capturar cliques do conteúdo.
function createStarfield() {
  const canvas = document.createElement("canvas");
  canvas.className = "space-dust";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0,
    height = 0,
    frame = 0,
    previous = 0,
    time = 0,
    paused = false;
  try {
    paused = sessionStorage.getItem("astro-stars-paused") === "1";
  } catch {}
  const pointer = { x: -1000, y: -1000 };
  const count = teacher ? 12 : page === "atividade" ? 20 : 36;
  const stars = Array.from({ length: count }, (_, i) => ({
    u: (i * 0.618033 + 0.08) % 1,
    v: (i * 0.414213 + 0.1) % 1,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    phase: i * 1.7,
    r: 0.7 + (i % 4) * 0.3,
  }));
  function stopped() {
    return (
      paused ||
      reduced.matches ||
      document.hidden ||
      document.body.classList.contains("astro-motion-off") ||
      document.body.classList.contains("motion-reduced")
    );
  }
  function draw(dt) {
    ctx.clearRect(0, 0, width, height);
    const dark = document.documentElement.dataset.theme === "dark";
    stars.forEach((p, i) => {
      // Deslocamento orbital lento: sem deslocar a interface ou a imagem de fundo.
      const bx = p.u * width + Math.sin(time * 0.15 + p.phase) * 18,
        by = p.v * height + Math.cos(time * 0.12 + p.phase) * 24;
      if (dt) {
        let ax = -p.dx * 0.009,
          ay = -p.dy * 0.009;
        const dx = bx + p.dx - pointer.x,
          dy = by + p.dy - pointer.y,
          d = Math.hypot(dx, dy);
        if (d < 115) {
          const force = (1 - d / 115) * 1.1;
          ax += (dx / (d || 1)) * force;
          ay += (dy / (d || 1)) * force;
        }
        p.vx = (p.vx + ax * dt) * Math.pow(0.89, dt);
        p.vy = (p.vy + ay * dt) * Math.pow(0.89, dt);
        p.dx = Math.max(-100, Math.min(100, p.dx + p.vx * dt));
        p.dy = Math.max(-100, Math.min(100, p.dy + p.vy * dt));
      }
      const x = bx + p.dx,
        y = by + p.dy;
      ctx.fillStyle = dark
        ? "rgba(235,227,255,.7)"
        : i % 5
          ? "rgba(123,114,151,.3)"
          : "rgba(182,144,85,.48)";
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (i % 9 === 0) {
        ctx.strokeStyle = dark ? "#ded3ef88" : "#ac9ac055";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - 3, y);
        ctx.lineTo(x + 3, y);
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x, y + 3);
        ctx.stroke();
      }
    });
  }
  function tick(now) {
    frame = 0;
    if (stopped()) return;
    const dt = Math.min(2, previous ? (now - previous) / 16.667 : 1);
    previous = now;
    time += dt / 60;
    draw(dt);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    draw(0);
    if (!stopped()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }
  addEventListener("resize", resize, { passive: true });
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "touch") {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -1000;
  });
  document.addEventListener("click", (e) => {
    if (
      teacher ||
      stopped() ||
      e.target.closest(
        "a,button,input,textarea,select,dialog,article,section,header,nav,.panel,.card,.avatar-viewer",
      )
    )
      return;
    if (stars.length >= 60) stars.splice(count, 1);
    stars.push({
      u: e.clientX / width,
      v: e.clientY / height,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      phase: time,
      r: 1.5,
    });
  });
  const motionButton =
    document.getElementById("starMotion") ||
    (page === "biblioteca" ? document.getElementById("motion") : null);
  if (motionButton)
    motionButton.addEventListener("click", () => {
      paused = !paused;
      try {
        sessionStorage.setItem("astro-stars-paused", paused ? "1" : "0");
      } catch {}
      motionButton.setAttribute("aria-pressed", String(paused));
      motionButton.setAttribute(
        "aria-label",
        paused ? "Ativar estrelas" : "Pausar estrelas",
      );
      if (page === "biblioteca")
        motionButton.textContent = paused ? "Ativar animações" : "Pausar animações";
      sync();
    });
  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  addEventListener("pageshow", sync);
  resize();
  sync();
}
createStarfield();

// No celular a trilha vem primeiro. A mesma visualização fica disponível em um diálogo acessível.
const avatarViewer = document.querySelector(".avatar-viewer");
if (avatarViewer && !teacher) {
  const originalParent = avatarViewer.parentElement;
  const placeholder = document.createComment("posição do visualizador");
  avatarViewer.before(placeholder);
  const open = document.createElement("button");
  open.type = "button";
  open.className = "mobile-avatar-button";
  open.textContent = "Ver meu explorador";
  open.setAttribute("aria-haspopup", "dialog");
  const dialog = document.createElement("dialog");
  dialog.className = "mobile-avatar-dialog";
  dialog.id = "mobileAvatarDialog";
  dialog.setAttribute("aria-label", "Seu explorador");
  open.setAttribute("aria-controls", dialog.id);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Fechar visualizador");
  dialog.append(close);
  document.body.append(dialog);
  document.querySelector(".intro-actions")?.append(open);
  if (!open.isConnected) document.querySelector(".intro")?.append(open);
  const small = matchMedia("(max-width:800px)");
  function position() {
    if (small.matches) dialog.append(avatarViewer);
    else {
      if (dialog.open) dialog.close();
      placeholder.after(avatarViewer);
    }
  }
  open.onclick = () => dialog.showModal();
  close.onclick = () => dialog.close();
  dialog.addEventListener("close", () => open.focus());
  small.addEventListener("change", position);
  position();
}
