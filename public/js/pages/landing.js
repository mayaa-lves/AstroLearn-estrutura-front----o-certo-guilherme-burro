/* Landing sem dependências: navegação, tabs por teclado, mascote e estrelas discretas. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    media = matchMedia("(prefers-reduced-motion:reduce)");
  let paused = false,
    lastReduced = media.matches;
  try {
    paused = sessionStorage.getItem("astrolearn-landing-motion") === "off";
  } catch {}
  let frame = 0,
    last = 0,
    t = 0,
    w = 0,
    h = 0;
  const canvas = $("landingStars"),
    ctx = canvas.getContext("2d"),
    pointer = { x: -999, y: -999 },
    stars = Array.from({ length: 32 }, (_, i) => ({
      u: (i * 0.618 + 0.13) % 1,
      v: (i * 0.414 + 0.09) % 1,
      dx: 0,
      dy: 0,
      phase: i * 1.3,
    }));
  const stopped = () => paused || media.matches || document.hidden;
  function draw(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of stars) {
      const bx = p.u * w + Math.sin(t * 0.14 + p.phase) * 11,
        by = p.v * h + Math.cos(t * 0.12 + p.phase) * 10,
        d = Math.hypot(bx + p.dx - pointer.x, by + p.dy - pointer.y);
      if (!stopped()) {
        let ax = 0,
          ay = 0;
        if (d < 95) {
          ax = ((bx + p.dx - pointer.x) / (d || 1)) * (95 - d) * 0.16;
          ay = ((by + p.dy - pointer.y) / (d || 1)) * (95 - d) * 0.16;
        }
        p.dx += (ax - p.dx * 0.08) * dt;
        p.dy += (ay - p.dy * 0.08) * dt;
      }
      ctx.fillStyle = "#b6a1c8";
      ctx.beginPath();
      ctx.arc(bx + p.dx, by + p.dy, 1 + (p.phase % 2) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function tick(now) {
    frame = 0;
    if (media.matches !== lastReduced) {
      sync();
      return;
    }
    if (stopped()) return;
    const dt = Math.min(2, (now - (last || now)) / 16.67);
    last = now;
    t += dt / 60;
    draw(dt);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    lastReduced = media.matches;
    if (stopped()) document.getAnimations().forEach((a) => a.cancel());
    cancelAnimationFrame(frame);
    last = 0;
    document.body.classList.toggle("motion-off", paused || media.matches);
    $("landingMotion").disabled = media.matches;
    $("landingMotion").textContent = media.matches
      ? "Movimento reduzido"
      : paused
        ? "Permitir animações"
        : "Pausar animações";
    $("landingMotion").setAttribute(
      "aria-pressed",
      String(paused || media.matches),
    );
    draw(0);
    if (!stopped() && ctx) frame = requestAnimationFrame(tick);
  }
  function resize() {
    w = innerWidth;
    h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch" || stopped()) return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const rect = $("heroScene").getBoundingClientRect();
      if (rect.bottom > 0 && innerWidth > 760) {
        $("heroScene").style.setProperty(
          "--scene-x",
          (e.clientX / innerWidth - 0.5) * 7 + "px",
        );
        $("heroScene").style.setProperty(
          "--scene-y",
          (e.clientY / innerHeight - 0.5) * 5 + "px",
        );
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener(
    "pointerleave",
    () => (pointer.x = pointer.y = -999),
  );
  window.addEventListener("resize", resize);
  window.addEventListener("focus", sync);
  window.addEventListener("pageshow", sync);
  document.addEventListener("visibilitychange", sync);
  media.addEventListener("change", sync);
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame));
  $("landingMotion").onclick = () => {
    paused = !paused;
    try {
      sessionStorage.setItem(
        "astrolearn-landing-motion",
        paused ? "off" : "on",
      );
    } catch {}
    sync();
  };
  resize();
  sync();
  const menu = $("siteNav"),
    toggle = $("mobileNavToggle");
  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }
  toggle.onclick = () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".site-header")) closeMenu();
  });
  matchMedia("(min-width:761px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });
  let origin = null;
  document.querySelectorAll("[data-demo]").forEach(
    (b) =>
      (b.onclick = () => {
        origin = b;
        $("demoDialog").showModal();
      }),
  );
  $("closeDemo").onclick = () => $("demoDialog").close();
  $("demoDialog").addEventListener("close", () => origin?.focus());
  const tips = [
    "Uma boa investigação começa com uma pergunta que você consegue testar.",
    "No robô, planeje os comandos antes de executar. Errar também faz parte de aprender.",
    "Uma equipe funciona melhor quando todos entendem a tarefa e conseguem contribuir.",
  ];
  let tip = 0;
  $("landingMascot").onclick = () => {
    $("mascotTip").textContent = tips[tip++ % tips.length];
    $("mascotTip").hidden = false;
    if (!stopped())
      $("landingMascot").animate?.(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-8deg) translateY(-8px)" },
          { transform: "rotate(5deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 750, easing: "ease-in-out" },
      );
  };
  const topics = {
    science: [
      "S",
      "OBSERVAR + INVESTIGAR",
      "Uma pergunta pode virar uma experiência.",
      "Compare como duas plantas crescem com diferentes quantidades de luz, mantendo as outras condições iguais. O que você precisa medir?",
    ],
    tech: [
      "T",
      "LÓGICA + CRIATIVIDADE",
      "Uma sequência de comandos abre caminhos.",
      "Como você programaria um robô para desviar de rochas? Planeje os passos, teste sua sequência e ajuste o que precisar.",
    ],
    engineering: [
      "E",
      "PLANEJAR + CONSTRUIR",
      "Toda solução começa com um protótipo.",
      "Desenhe um explorador para um terreno irregular. Que rodas, materiais e instrumentos você escolheria? Justifique seu projeto.",
    ],
    art: [
      "A",
      "EXPRESSAR + IMAGINAR",
      "Uma ideia também pode ser vista.",
      "Crie uma representação de um mundo que você investigou. Combine formas, cores e informação para contar o que descobriu.",
    ],
    math: [
      "M",
      "MEDIR + COMPARAR",
      "Os números ajudam a fazer perguntas.",
      "Registre os resultados de um experimento e compare as medidas. Qual gráfico deixa as diferenças mais claras?",
    ],
  };
  const tabs = [...document.querySelectorAll("[data-topic]")];
  function topic(b) {
    const v = topics[b.dataset.topic];
    tabs.forEach((t) => {
      t.setAttribute("aria-selected", String(t === b));
      t.tabIndex = t === b ? 0 : -1;
    });
    $("steamPanel").setAttribute("aria-labelledby", b.id);
    ["topicWord", "topicTag", "topicTitle", "topicText"].forEach(
      (id, i) => ($(id).textContent = v[i]),
    );
  }
  tabs.forEach((b, i) => {
    b.onclick = () => topic(b);
    b.onkeydown = (e) => {
      let n;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[n].focus();
      topic(tabs[n]);
    };
  });
})();
