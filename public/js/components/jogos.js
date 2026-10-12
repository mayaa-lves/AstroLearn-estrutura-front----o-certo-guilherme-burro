/* Progresso exclusivamente local. Nunca concede moedas/conquistas da plataforma. */
const KEY = "astrolearn-games-v1";
export function readProgress() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v?.version === 1)
      return {
        robo: Number.isInteger(v.robo) ? Math.max(0, Math.min(3, v.robo)) : 0,
        quiz: Number.isInteger(v.quiz)
          ? Math.max(0, Math.min(6, v.quiz))
          : null,
        crew: v.crew === true,
      };
  } catch {}
  return { robo: 0, quiz: null, crew: false };
}
export function saveProgress(kind, value) {
  const previous = readProgress(),
    next = { ...previous };
  if (kind === "robo") next.robo = Math.max(previous.robo, value);
  if (kind === "quiz") next.quiz = Math.max(previous.quiz ?? 0, value);
  if (kind === "crew") next.crew = true;
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, ...next }));
    return true;
  } catch {
    return false;
  }
}
export function result(title, text, extra = "") {
  const d = document.getElementById("resultDialog");
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultText").textContent = text;
  document.getElementById("resultExtra").textContent = extra;
  d.showModal();
}
export function initDialogs() {
  const buttons = document.querySelectorAll("[data-dialog]");
  buttons.forEach(
    (b) =>
      (b.onclick = () => document.getElementById(b.dataset.dialog).showModal()),
  );
  document
    .querySelectorAll("[data-close]")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
}
export function reduced() {
  return (
    document.body.classList.contains("astro-motion-off") ||
    matchMedia("(prefers-reduced-motion:reduce)").matches
  );
}
