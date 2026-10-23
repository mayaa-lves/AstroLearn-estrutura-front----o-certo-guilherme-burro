/* Pequeno paralaxe da nave na entrada. O universo tem seu próprio renderizador. */
export function initSpaceEffects() {
  const hangar = document.getElementById('hangarScene');
  if (!hangar) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const reset = () => {
    hangar.style.setProperty('--ship-x','0px');
    hangar.style.setProperty('--ship-y','0px');
  };
  hangar.addEventListener('pointermove',event=>{
    if (media.matches || !fine.matches || document.body.classList.contains('astro-motion-off')) return;
    const r=hangar.getBoundingClientRect();
    hangar.style.setProperty('--ship-x',((event.clientX-r.left)/r.width-.5)*32+'px');
    hangar.style.setProperty('--ship-y',((event.clientY-r.top)/r.height-.5)*20+'px');
  });
  hangar.addEventListener('pointerleave',reset);
  media.addEventListener('change',reset);
  document.addEventListener('astrolearn:preferences',reset);
}