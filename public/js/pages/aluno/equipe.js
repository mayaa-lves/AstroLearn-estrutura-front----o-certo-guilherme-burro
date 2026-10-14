import { sessaoObrigatoria } from "../../services/conexao.js";
import { dashboard } from "../../services/aluno.js";
const s = sessaoObrigatoria("aluno");
const $ = (id) => document.getElementById(id);
$("organize").disabled = true;
$("ideaForm").onsubmit = (e) => e.preventDefault();
$("ideaForm").querySelector("button").disabled = true;
$("idea").disabled = true;
$("storageNotice").textContent =
  "Equipe real da sua turma. Combinados e mural compartilhado ainda dependem de funções no backend.";
$("taskList").replaceChildren();
$("wall").replaceChildren();
document.querySelector(".mission-body a").hidden = true;
$("missionTitle").textContent = "As atividades continuam na sua trilha";
document.querySelector(".mission-body p").textContent =
  "Consulte as orientações do professor. O backend ainda não informa o formato individual ou em equipe.";
dashboard()
  .then((d) => {
    $("members").replaceChildren();
    const label = document.querySelector(".team-label");
    if (label)
      label.textContent = d.equipe
        ? d.equipe.nome +
          " · " +
          (1 + (d.colegas || []).length) +
          " integrantes"
        : "Sem equipe";
    const title = document.querySelector("main h1");
    if (title) title.textContent = d.equipe?.nome || "Minha equipe";
    if (!d.equipe) {
      $("storageNotice").textContent =
        "Você ainda não foi incluído em uma equipe pelo professor.";
      return;
    }
    for (const m of [s.usuario, ...d.colegas]) {
      const e = document.createElement("article");
      e.className = "member-card";
      const h = document.createElement("h3");
      h.textContent = m.nome;
      e.append(h);
      $("members").append(e);
    }
  })
  .catch((e) => ($("storageNotice").textContent = e.message));

const close = (e) => e.closest("dialog")?.close();
document
  .querySelectorAll("[data-close]")
  .forEach((e) => (e.onclick = () => close(e)));
const previewInfo = document.getElementById("previewInfo");
previewInfo.textContent =
  "Equipe da turma · funções compartilhadas em preparação";
previewInfo.onclick = () => {
  document.getElementById("infoTitle").textContent = "Sua equipe";
  document.getElementById("infoText").textContent =
    "Os integrantes são cadastrados pelo professor. Mural e responsabilidades ainda não são sincronizados pela API.";
  document.getElementById("info").showModal();
};
