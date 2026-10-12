/* Demonstração no mesmo navegador. Não representa uma sessão ou envio ao servidor. */
export async function iniciarAtividadeDemo({
  upload,
  resposta,
  entregaStatus,
  revisao,
}) {
  const D = window.TeacherData,
    $ = (id) => document.getElementById(id),
    params = new URLSearchParams(location.search),
    preview = params.get("preview") === "1",
    mission =
      params.get("atividade") ||
      ["m00", "m01", "m02"][Number(params.get("missao") ?? 1)] ||
      "m01";
  const teacherLink = document.createElement("a");
  teacherLink.href =
    "../professor/atividades.html?sala=" +
    encodeURIComponent(params.get("sala") || "s0");
  teacherLink.textContent = "← Voltar ao professor";
  teacherLink.className = "text-button";
  if (preview) document.querySelector("main").prepend(teacherLink);
  const materials = document.createElement("div");
  materials.className = "demo-materials";
  materials.setAttribute("aria-label", "Materiais da atividade na prévia");
  document.querySelector(".materials-card,.resources-card")?.append(materials);
  if (!materials.isConnected)
    $("material-roteiro").parentElement.append(materials);
  const history = document.createElement("div");
  history.className = "demo-question-history";
  history.setAttribute("aria-label", "Perguntas e respostas locais");
  $("pergunta-form").after(history);
  const form = $("pergunta-form"),
    button = form.querySelector("button"),
    question = $("pergunta"),
    status = $("pergunta-status");
  let busy = false;
  const objectURLs = [];
  async function questions() {
    const rows = await D.studentQuestions(mission);
    history.replaceChildren();
    for (const q of rows) {
      const article = document.createElement("article");
      article.className = "demo-question";
      const p = document.createElement("p");
      p.textContent = "Você: " + q.texto;
      article.append(p);
      const answer = document.createElement("p");
      answer.textContent = q.resposta
        ? "Professor: " + q.resposta
        : "Aguardando resposta nesta prévia.";
      article.append(answer);
      history.append(article);
    }
  }
  async function feedback() {
    const record = await D.demoStudentWork(mission),
      el = document.querySelector(".feedback-card p");
    if (record?.status === "corrigido")
      el.textContent =
        "Nota: " +
        record.nota +
        " / 10. " +
        (record.comentario_professor || "Sem comentário.");
    else if (record)
      el.textContent =
        "Entrega local registrada. Aguardando correção na prévia do professor.";
    else
      el.textContent =
        "Seu retorno aparecerá aqui depois da correção na demonstração.";
  }
  try {
    const room = await D.room(params.get("sala") || "s0"),
      activity = room.missoes.find((m) => m.id === mission);
    if (!activity) throw new Error("Atividade não encontrada.");
    if (!preview && activity.status_publicacao === "rascunho")
      throw new Error("Esta atividade ainda é um rascunho.");
    if (params.get("atividade")) {
      $("atividade-titulo").textContent = activity.titulo;
      $("atividade-objetivo").textContent =
        activity.descricao || "Orientação ainda em preparação.";
      $("atividade-resumo").textContent = preview
        ? "Prévia da proposta do professor"
        : "Investigue, registre e compartilhe sua descoberta.";
      $("missionType").textContent =
        activity.tipo_atividade === "equipe"
          ? "Em equipe · entrega individual"
          : "Individual";
      $("atividade-passos").replaceChildren();
      const li = document.createElement("li");
      li.textContent =
        "Siga a orientação acima e use os materiais do professor.";
      $("atividade-passos").append(li);
    }
    const files = await D.files(room.sala.id, mission);
    for (const f of files) {
      const a = document.createElement("a");
      a.textContent = f.name;
      a.download = f.name;
      a.href = URL.createObjectURL(f.blob);
      objectURLs.push(a.href);
      materials.append(a);
    }
    if (!preview) await Promise.all([questions(), feedback()]);
    if (preview) {
      $("submitDelivery").disabled = true;
      button.disabled = true;
      $("confirmDemoSubmission").hidden = true;
      $("deliveryNotice").textContent =
        "Prévia do professor: somente leitura, sem entrega.";
      $("pergunta").disabled = true;
      resposta.disabled = true;
      $("adicionar-arquivos").disabled = true;
    }
  } catch (e) {
    entregaStatus.textContent = e.message;
    $("confirmDemoSubmission").disabled = true;
    button.disabled = true;
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy || preview) return;
    const text = question.value.trim();
    if (!text) {
      status.textContent = "Escreva uma pergunta antes de enviar.";
      question.setAttribute("aria-invalid", "true");
      question.focus();
      return;
    }
    busy = true;
    button.disabled = true;
    try {
      await D.ask(mission, text);
      question.value = "";
      status.textContent =
        "Pergunta salva nesta demonstração. Abra Perguntas na prévia do professor.";
      await questions();
    } catch (err) {
      status.textContent = err.message;
    } finally {
      busy = false;
      button.disabled = false;
    }
  });
  $("confirmDemoSubmission").onclick = async () => {
    if (busy || preview) return;
    busy = true;
    $("confirmDemoSubmission").disabled = true;
    try {
      await D.demoSubmission(mission, resposta.value, upload.getFiles());
      $("demoSubmissionStatus").textContent =
        "Entrega local confirmada. A prévia do professor recebeu um aviso. Nenhum dado foi enviado à escola.";
      entregaStatus.textContent = "Entrega registrada apenas neste navegador.";
      await feedback();
    } catch (e) {
      $("demoSubmissionStatus").textContent = e.message;
    } finally {
      busy = false;
      $("confirmDemoSubmission").disabled = false;
    }
  };
  window.addEventListener("storage", (e) => {
    if (e.key === "astrolearn-professor-v2" && !preview)
      Promise.all([feedback(), questions()]).catch(
        (err) => (status.textContent = err.message),
      );
  });
  window.addEventListener("pagehide", () =>
    objectURLs.forEach((u) => URL.revokeObjectURL(u)),
  );
}
