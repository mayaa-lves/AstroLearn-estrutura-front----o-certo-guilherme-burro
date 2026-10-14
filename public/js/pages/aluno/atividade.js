import { sessaoObrigatoria, api } from "../../services/conexao.js";
import { missao, registrarConclusao } from "../../services/aluno.js";
const params = new URLSearchParams(location.search);
const preview = params.get("preview") === "1";
const session = sessaoObrigatoria(preview ? "professor" : "aluno");
const $ = (id) => document.getElementById(id);
const missionId = new URLSearchParams(location.search).get("atividade");
const submit = $("submitDelivery");
submit.disabled = true;
$("entrega-form").onsubmit = (e) => e.preventDefault();
$("pergunta-form").onsubmit = (e) => e.preventDefault();
$("pergunta").disabled = true;
$("pergunta-form").querySelector("button").disabled = true;
$("pergunta-status").textContent =
  "Perguntas ainda não são recebidas pelo backend. Fale diretamente com seu professor.";
$("arquivos").disabled = true;
$("adicionar-arquivos").disabled = true;
$("resposta").disabled = true;
$("deliveryNotice").textContent =
  "O backend atual registra apenas que você realizou a atividade. Texto e arquivos não serão enviados. Combine a entrega com seu professor.";
$("atividade-passos").replaceChildren();
$("criteriaList").replaceChildren();
$("instructions").querySelector(".objective").textContent =
  "Carregando orientação…";
$("example").textContent = "Siga a orientação da sua turma.";
$("materials")
  .querySelectorAll(".resource")
  .forEach((e) => e.remove());
function text(id, value) {
  const e = $(id);
  if (e) e.textContent = value;
}
function safeLink(raw) {
  try {
    const u = new URL(raw);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
function materials(rows) {
  for (const m of rows || []) {
    const e = document.createElement("div");
    const h = document.createElement("h3");
    h.textContent = m.titulo;
    const p = document.createElement("p");
    p.textContent = m.descricao || "";
    e.append(h, p);
    for (const raw of m.links || []) {
      const href = safeLink(typeof raw === "string" ? raw : raw.url);
      if (!href) continue;
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent =
        typeof raw === "string"
          ? "Abrir material"
          : raw.titulo || "Abrir material";
      e.append(a);
    }
    $("materials").append(e);
  }
}
async function load() {
  if (!missionId) {
    text("entrega-status", "Abra uma atividade pela trilha da sua turma.");
    return;
  }
  try {
    let d;
    if (preview) {
      const room = await api(
        "/api/professor/salas/" + encodeURIComponent(params.get("sala") || ""),
      );
      const activity = room.missoes.find((m) => m.id === missionId);
      if (!activity) throw Error("Atividade não encontrada nesta turma.");
      d = {
        missao: { ...activity, salas: room.sala },
        bloqueada: true,
        materiais: [],
      };
    } else d = await missao(missionId);
    const m = d.missao;
    document.title = m.titulo + " · AstroLearn";
    text("atividade-titulo", m.titulo);
    text("atividade-resumo", m.salas?.nome || "Atividade da turma");
    text(
      "atividade-objetivo",
      m.descricao || "Aguarde as orientações do professor.",
    );
    text("missionNumber", "MISSÃO " + m.ordem);
    text("missionType", "Entrega individual");
    text(
      "missionDuration",
      m.data_limite
        ? "Prazo: " + new Date(m.data_limite).toLocaleDateString("pt-BR")
        : "Sem prazo definido",
    );
    const prog = d.progresso;
    text(
      "deliveryStatus",
      d.bloqueada
        ? "Bloqueada"
        : prog?.status === "corrigido"
          ? "Corrigida"
          : prog?.status === "entregue"
            ? "Aguardando correção"
            : "Não registrado",
    );
    text(
      "entrega-status",
      prog?.status === "corrigido"
        ? "Nota: " +
            (prog.nota ?? "—") +
            " · " +
            (prog.comentario_professor || "Sem comentário")
        : d.bloqueada
          ? "Aguarde a validação da missão anterior."
          : "",
    );
    if (preview) {
      text(
        "deliveryNotice",
        "Visualização do professor: somente leitura, sem entrega.",
      );
      text("entrega-status", "Prévia da atividade publicada.");
    }
    materials(d.materiais);
    submit.textContent = "Registrar atividade realizada";
    submit.disabled =
      d.bloqueada || ["entregue", "corrigido"].includes(prog?.status);
  } catch (e) {
    text("entrega-status", e.message);
  }
}
$("entrega-form").onsubmit = async (e) => {
  e.preventDefault();
  if (submit.disabled) return;
  if (
    !window.confirm(
      "Registrar somente a realização da atividade? Texto e arquivos NÃO serão enviados.",
    )
  )
    return;
  submit.disabled = true;
  try {
    await registrarConclusao(missionId);
    text("deliveryStatus", "Aguardando correção");
    text(
      "entrega-status",
      "Realização registrada. Entregue seu trabalho ao professor pelo meio combinado.",
    );
  } catch (e) {
    text("entrega-status", e.message);
    submit.disabled = false;
  }
};
load();
