import { readProgress } from "../../../components/jogos.js";
const cards = [...document.querySelectorAll("[data-kind]")];
for (const b of document.querySelectorAll("[data-filter]"))
  b.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    let count = 0;
    cards.forEach((c) => {
      c.hidden =
        b.dataset.filter !== "todos" && c.dataset.kind !== b.dataset.filter;
      if (!c.hidden) count++;
    });
    document.getElementById("filterStatus").textContent =
      count + " jogos exibidos.";
  });
const progress = readProgress();
if (progress.robo)
  document.getElementById("roboProgress").textContent =
    progress.robo + " de 3 desafios concluídos aqui";
if (progress.quiz != null)
  document.getElementById("quizProgress").textContent =
    "Melhor resultado local: " + progress.quiz + "/6";
if (progress.crew)
  document.getElementById("crewProgress").textContent =
    "Expedição concluída neste aparelho";
