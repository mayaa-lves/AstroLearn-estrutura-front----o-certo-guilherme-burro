import { sessaoObrigatoria } from "../../services/conexao.js";
import { biblioteca } from "../../services/aluno.js";
sessaoObrigatoria("aluno");
const $ = (id) => document.getElementById(id);
let rows = [];
function link(raw) {
  try {
    const u = new URL(typeof raw === "string" ? raw : raw.url);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
function render() {
  const term = ($("search")?.value || "").toLocaleLowerCase("pt-BR");
  const filtered = rows.filter((m) =>
    (m.titulo + " " + (m.descricao || ""))
      .toLocaleLowerCase("pt-BR")
      .includes(term),
  );
  $("materials").replaceChildren();
  for (const m of filtered) {
    const card = document.createElement("article");
    card.className = "material";
    const h = document.createElement("h3");
    h.textContent = m.titulo;
    const p = document.createElement("p");
    p.textContent = m.descricao || "Material disponibilizado pelo professor.";
    card.append(h, p);
    for (const raw of m.links || []) {
      const href = link(raw);
      if (!href) continue;
      const a = document.createElement("a");
      a.className = "primary";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent =
        typeof raw === "string"
          ? "Abrir material"
          : raw.titulo || "Abrir material";
      card.append(a);
    }
    $("materials").append(card);
  }
  $("resultCount").textContent = filtered.length + " materiais da sua turma";
  $("empty").hidden = filtered.length > 0;
  $("emptyTitle").textContent = "Nenhum material encontrado";
  $("emptyText").textContent = rows.length
    ? "Tente outra busca."
    : "Seu professor ainda não adicionou materiais.";
}
$("search")?.addEventListener("input", render);
$("reset").onclick = () => {
  if ($("search")) $("search").value = "";
  render();
};
biblioteca()
  .then((d) => {
    rows = d.materiais || [];
    render();
  })
  .catch((e) => ($("resultCount").textContent = e.message));
