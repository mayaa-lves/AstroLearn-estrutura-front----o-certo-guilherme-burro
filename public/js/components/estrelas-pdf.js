(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  try {
    paused = sessionStorage.getItem("astro-stars-paused") === "1";
  } catch {}
  const canvas = document.createElement("canvas");
  canvas.className = "sky";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  let frame = 0,
    w = 0,
    h = 0,
    last = 0,
    t = 0;
  const pointer = { x: -999, y: -999 };
  const stars = Array.from({ length: 28 }, (_, i) => ({
    u: (i * 0.618 + 0.11) % 1,
    v: (i * 0.414 + 0.07) % 1,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    phase: i * 1.4,
  }));
  function stopped() {
    return (
      paused ||
      media.matches ||
      document.body.classList.contains("astro-motion-off") ||
      document.hidden
    );
  }
  function draw(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    stars.forEach((p, i) => {
      const bx = p.u * w + Math.sin(t * 0.18 + p.phase) * 10,
        by = p.v * h + Math.cos(t * 0.16 + p.phase) * 12;
      if (!stopped()) {
        let ax = -p.dx * 0.012,
          ay = -p.dy * 0.012;
        const x = bx + p.dx - pointer.x,
          y = by + p.dy - pointer.y,
          d = Math.hypot(x, y);
        if (d < 130) {
          const force = (1 - d / 130) * 1.9;
          ax += (d > 1 ? x / d : 1) * force;
          ay += (d > 1 ? y / d : 0) * force;
        }
        p.vx = (p.vx + ax * dt) * Math.pow(0.88, dt);
        p.vy = (p.vy + ay * dt) * Math.pow(0.88, dt);
        p.dx = Math.max(-100, Math.min(100, p.dx + p.vx * dt));
        p.dy = Math.max(-100, Math.min(100, p.dy + p.vy * dt));
      }
      const x = bx + p.dx,
        y = by + p.dy,
        r = 1 + (i % 3) * 0.35;
      ctx.fillStyle = "#fffbf4";
      ctx.shadowColor = "#fff3dc";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
  function tick(now) {
    frame = 0;
    if (stopped()) return;
    const dt = Math.min(2, (now - (last || now)) / 16.67);
    last = now;
    t += dt / 60;
    draw(dt);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    document.body.classList.toggle("motion-paused", paused || media.matches);
    $("motion").setAttribute("aria-pressed", String(paused || media.matches));
    $("motion").textContent =
      media.matches || document.body.classList.contains("astro-motion-off")
        ? "Movimento reduzido"
        : paused
          ? "Permitir animações"
          : "Pausar animações";
    $("motion").disabled =
      media.matches || document.body.classList.contains("astro-motion-off");
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
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }
  $("motion").onclick = () => {
    paused = !paused;
    try {
      sessionStorage.setItem("astro-stars-paused", paused ? "1" : "0");
    } catch {}
    sync();
  };
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -999;
  });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", sync);
  media.addEventListener("change", sync);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
  });
  document.addEventListener("astrolearn:preferences", sync);
  resize();
  sync();
})();
