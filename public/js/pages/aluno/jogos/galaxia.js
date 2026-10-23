/* Uma única animação, limitada ao cenário. Sem dependência de WebGL. */
export function initSpaceEffects() {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const reduced = () => media.matches || document.body.classList.contains('astro-motion-off');
  const hangar = document.getElementById('hangarScene');
  if (hangar) {
    hangar.addEventListener('pointermove', event => {
      if (reduced() || !fine.matches) return;
      const r = hangar.getBoundingClientRect();
      hangar.style.setProperty('--ship-x', ((event.clientX - r.left) / r.width - .5) * 32 + 'px');
      hangar.style.setProperty('--ship-y', ((event.clientY - r.top) / r.height - .5) * 20 + 'px');
    });
    hangar.addEventListener('pointerleave', () => {
      hangar.style.setProperty('--ship-x', '0px');
      hangar.style.setProperty('--ship-y', '0px');
    });
  }
  const stage = document.getElementById('galaxyShell');
  if (!stage) return;
  const canvas = document.getElementById('galaxyStars');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const ship = document.getElementById('flightShip');
  const content = document.getElementById('galaxyContent');
  const pointer = { x: -1000, y: -1000 };
  const flight = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 0, height = 0, stars = [], frame = 0, previous = 0, active = null;
  const interactive = 'a,button,input,select,textarea,dialog';
  function star(x = Math.random() * width, y = Math.random() * height, life = Infinity) {
    return { x, y, radius: .5 + Math.random() * 1.2, speed: 7 + Math.random() * 14, phase: Math.random() * 6.28, vx: 0, vy: 0, life, age: 0 };
  }
  function resize() {
    const oldW = width || stage.clientWidth, oldH = height || stage.clientHeight;
    width = stage.clientWidth; height = stage.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!stars.length) stars = Array.from({ length: Math.min(140, Math.round(width * height / 6500)) }, () => star());
    else stars.forEach(s => { s.x *= width / oldW; s.y *= height / oldH; });
    flight.x = flight.tx = width * .47; flight.y = flight.ty = Math.max(30, content.clientHeight * .2);
    if (!frame) draw(0, 0);
  }
  function draw(time, dt) {
    ctx.clearRect(0, 0, width, height);
    const moving = !reduced();
    stars.forEach(s => {
      if (dt && moving) {
        s.age += dt;
        const dx = s.x - pointer.x, dy = s.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 90) {
          s.vx += dx / distance * (90 - distance) * dt * 1.6;
          s.vy += dy / distance * (90 - distance) * dt * 1.6;
        }
        s.vx *= Math.exp(-3 * dt); s.vy *= Math.exp(-3 * dt);
        if (s.age > .65 || s.life === Infinity) {
          s.x += (s.speed + s.vx) * dt;
          s.y += (s.speed * .13 + s.vy) * dt;
        }
        s.x = (s.x + width) % width; s.y = (s.y + height) % height;
      }
      const fade = Number.isFinite(s.life) ? Math.min(1, Math.max(0, s.life - s.age)) : 1;
      ctx.globalAlpha = fade * (moving ? .58 + Math.sin(time * .001 + s.phase) * .2 : .65);
      ctx.fillStyle = '#e6eaff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill();
    });
    stars = stars.filter(s => s.age < s.life);
    ctx.globalAlpha = 1;
    if (moving && fine.matches && width > 650 && !document.body.classList.contains('is-blocked')) {
      const ease = dt ? 1 - Math.exp(-7 * dt) : 1;
      const dx = flight.tx - flight.x;
      flight.x += dx * ease; flight.y += (flight.ty - flight.y) * ease;
      ship.style.transform = `translate(${flight.x}px,${flight.y}px) rotate(${Math.max(-7,Math.min(7,-dx*.04))}deg)`;
      ship.hidden = false;
      if (active?.isConnected) {
        const sr = stage.getBoundingClientRect(), ar = active.getBoundingClientRect();
        ctx.strokeStyle = '#c3a1ff88'; ctx.lineWidth = 1; ctx.setLineDash([3, 8]);
        ctx.beginPath(); ctx.moveTo(flight.x + 40, flight.y + content.offsetTop + 25);
        ctx.lineTo(ar.left - sr.left + ar.width / 2, ar.top - sr.top + ar.height / 2); ctx.stroke(); ctx.setLineDash([]);
      }
    } else ship.hidden = true;
  }
  function tick(time) {
    frame = 0;
    const dt = Math.min((time - (previous || time)) / 1000, .04);
    previous = time; draw(time, dt);
    if (!document.hidden && !reduced()) frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    draw(performance.now(), 0);
    if (!document.hidden && !reduced()) frame = requestAnimationFrame(tick);
  }
  stage.addEventListener('pointermove', event => {
    if (!fine.matches || reduced()) return;
    const r = stage.getBoundingClientRect();
    pointer.x = event.clientX - r.left; pointer.y = event.clientY - r.top;
    flight.tx = Math.max(0, Math.min(width - 110, pointer.x - 55));
    flight.ty = Math.max(0, Math.min(content.clientHeight - 95, pointer.y - content.offsetTop - 50));
  });
  stage.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -1000;
    flight.tx = width * .47; flight.ty = content.clientHeight * .2;
  });
  stage.addEventListener('click', event => {
    if (event.target.closest(interactive) || reduced() || document.body.classList.contains('is-blocked')) return;
    const r = stage.getBoundingClientRect();
    stars.push(star(event.clientX - r.left, event.clientY - r.top, 16));
    if (stars.length > 190) stars.shift();
  });
  document.querySelectorAll('.destination').forEach(button => {
    button.addEventListener('pointerenter', () => { active = button; });
    button.addEventListener('pointerleave', () => { if (active === button) active = null; });
    button.addEventListener('focus', () => { active = button; });
    button.addEventListener('blur', () => { if (active === button) active = null; });
  });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('astrolearn:preferences', sync);
  document.addEventListener('astrolearn:motion', sync);
  media.addEventListener('change', sync); fine.addEventListener('change', sync);
  new ResizeObserver(resize).observe(stage);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', sync);
  resize(); sync();
}