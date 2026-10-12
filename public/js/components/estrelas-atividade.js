/* Estrelas com profundidade: decoração sem capturar cliques ou cobrir os cartões. */
(() => {
  "use strict";
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000, active: false };
  let frame = 0,
    previous = 0,
    time = 0,
    paused = false;
  const button = document.getElementById("starMotion");
  try {
    paused = sessionStorage.getItem("astro-stars-paused") === "1";
  } catch {}
  const stopped = () =>
    paused ||
    media.matches ||
    document.body.classList.contains("astro-motion-off") ||
    document.hidden;
  const layers = [];
  function makeLayer(parent, count, hero) {
    const canvas = document.createElement("canvas");
    canvas.className = hero
      ? "stars-canvas hero-stars"
      : "stars-canvas ambient-stars";
    canvas.setAttribute("aria-hidden", "true");
    parent.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }
    const particles = Array.from({ length: count }, (_, i) => ({
      u: (i * 0.61803398875 + 0.12) % 1,
      v: (i * 0.41421356237 + 0.18) % 1,
      size: hero ? 1 + (i % 4) * 0.5 : 1.2 + (i % 5) * 0.55,
      phase: i * 1.7,
      depth: 0.45 + (i % 4) * 0.18,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      gold: i % 3 === 0,
    }));
    layers.push({ canvas, ctx, particles, hero, w: 0, h: 0 });
  }
  makeLayer(document.body, 22, false);
  makeLayer(document.querySelector(".mission-banner"), 12, true);
  // Estrelas desenhadas com reflexo, volume e luz suave.
  function star(ctx, x, y, r, gold, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 7);
    glow.addColorStop(
      0,
      gold ? "rgba(255,222,166,.65)" : "rgba(231,219,255,.65)",
    );
    glow.addColorStop(
      0.25,
      gold ? "rgba(244,189,119,.2)" : "rgba(192,170,235,.2)",
    );
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 7, -r * 7, r * 14, r * 14);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = gold ? "#fff2d4" : "#fffaff";
    ctx.fill();
    if (r > 2.3) {
      ctx.strokeStyle = gold ? "rgba(255,226,182,.6)" : "rgba(245,236,255,.6)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-r * 2.7, 0);
      ctx.lineTo(r * 2.7, 0);
      ctx.moveTo(0, -r * 2.7);
      ctx.lineTo(0, r * 2.7);
      ctx.stroke();
    }
    ctx.restore();
  }
  function draw(layer, dt, staticFrame) {
    const { ctx, canvas, particles, w, h } = layer;
    ctx.clearRect(0, 0, w, h);
    const rect = canvas.getBoundingClientRect();
    const mx = pointer.x - rect.left,
      my = pointer.y - rect.top;
    particles.forEach((p) => {
      const bx =
          p.u * w +
          (staticFrame ? 0 : Math.sin(time * 0.23 + p.phase) * 12 * p.depth),
        by =
          p.v * h +
          (staticFrame ? 0 : Math.cos(time * 0.19 + p.phase) * 18 * p.depth);
      if (!staticFrame) {
        let ax = -p.dx * 0.012,
          ay = -p.dy * 0.012;
        if (pointer.active) {
          const dx = bx + p.dx - mx,
            dy = by + p.dy - my,
            d = Math.hypot(dx, dy),
            radius = 145;
          if (d < radius) {
            const force = (1 - d / radius) * 2.5 * p.depth;
            ax += (d > 0.5 ? dx / d : Math.cos(p.phase)) * force;
            ay += (d > 0.5 ? dy / d : Math.sin(p.phase)) * force;
          }
        }
        p.vx = (p.vx + ax * dt) * Math.pow(0.86, dt);
        p.vy = (p.vy + ay * dt) * Math.pow(0.86, dt);
        p.dx = Math.max(-150, Math.min(150, p.dx + p.vx * dt));
        p.dy = Math.max(-150, Math.min(150, p.dy + p.vy * dt));
      }
      star(
        ctx,
        bx + (staticFrame ? 0 : p.dx),
        by + (staticFrame ? 0 : p.dy),
        p.size,
        p.gold,
        layer.hero ? 0.75 : 0.9,
      );
    });
  }
  function tick(now) {
    frame = 0;
    if (stopped()) return;
    const dt = Math.min(2, previous ? (now - previous) / 16.667 : 1);
    previous = now;
    time += dt / 60;
    layers.forEach((l) => draw(l, dt, false));
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    pointer.active = false;
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute(
      "aria-label",
      paused
        ? "Ativar movimento das estrelas"
        : "Pausar movimento das estrelas",
    );
    button.title = media.matches
      ? "Movimento reduzido pelo aparelho"
      : paused
        ? "Ativar estrelas"
        : "Pausar estrelas";
    layers.forEach((l) => draw(l, 0, true));
    if (!stopped() && layers.length) frame = requestAnimationFrame(tick);
  }
  function resize() {
    layers.forEach((l) => {
      const r = l.canvas.getBoundingClientRect(),
        scale = Math.min(window.devicePixelRatio || 1, 1.5);
      l.w = r.width;
      l.h = r.height;
      l.canvas.width = Math.round(r.width * scale);
      l.canvas.height = Math.round(r.height * scale);
      l.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    });
    sync();
  }
  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch" || stopped()) return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener(
    "pointerleave",
    () => (pointer.active = false),
  );
  window.addEventListener("blur", () => (pointer.active = false));
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", sync);
  media.addEventListener?.("change", sync);
  document.addEventListener("astrolearn:preferences", sync);
  button.onclick = () => {
    paused = !paused;
    try {
      sessionStorage.setItem("astro-stars-paused", paused ? "1" : "0");
    } catch {}
    sync();
  };
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame));
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(resize);
    observer.observe(document.querySelector(".mission-banner"));
  }
  resize();
})();
