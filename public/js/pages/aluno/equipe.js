/* Prévia local: não há presença online, chat compartilhado ou notas de equipe. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const members = ["Maya", "Isabelly", "Guilherme", "Alex"];
  const defaults = [
    "Pesquisa do terreno",
    "Esboço do robô",
    "Materiais e construção",
    "Registro da investigação",
  ];
  const key = "astrolearn-team-v1";
  let state = { tasks: [...defaults], notes: [] },
    opener = null,
    pendingRemove = null;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    if (raw && typeof raw === "object") {
      state.tasks = defaults.map((value, i) =>
        typeof raw.tasks?.[i] === "string" && raw.tasks[i].trim()
          ? raw.tasks[i].trim().slice(0, 120)
          : value,
      );
      if (Array.isArray(raw.notes)) {
        const ids = new Set();
        state.notes = raw.notes
          .filter(
            (n) =>
              n &&
              typeof n.id === "string" &&
              !ids.has(n.id) &&
              ids.add(n.id) &&
              typeof n.text === "string" &&
              n.text.trim() &&
              Number.isFinite(n.date) &&
              Number.isFinite(new Date(n.date).getTime()),
          )
          .slice(-30)
          .map((n) => ({
            id: n.id.slice(0, 100),
            text: n.text.slice(0, 1000),
            date: n.date,
          }));
      }
    }
  } catch {
    $("storageNotice").textContent =
      "Não foi possível recuperar os dados locais. Você pode continuar nesta visita.";
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      $("storageNotice").textContent = "";
      return true;
    } catch {
      $("storageNotice").textContent =
        "Não foi possível salvar neste navegador. Copie os combinados e suas ideias antes de sair. As alterações valem apenas enquanto a página estiver aberta.";
      return false;
    }
  }
  function open(dialog, trigger) {
    opener = trigger || document.activeElement;
    dialog.showModal();
  }
  function renderMembers() {
    const list = $("members");
    list.replaceChildren();
    members.forEach((name, i) => {
      const b = document.createElement("button");
      b.className = "member";
      b.setAttribute(
        "aria-label",
        `Ver responsabilidade de ${name}${i === 0 ? ", você" : ""}`,
      );
      b.innerHTML = `<span class="portrait portrait-${i}" aria-hidden="true"></span><strong>${name}${i === 0 ? " <span>· Você</span>" : ""}</strong>`;
      b.onclick = () => {
        $("memberPortrait").className = "portrait portrait-" + i;
        $("memberTitle").textContent = name + (i === 0 ? " · Você" : "");
        $("memberTask").textContent =
          "Responsabilidade combinada: " + state.tasks[i];
        open($("memberDialog"), b);
      };
      list.append(b);
    });
  }
  function renderTasks() {
    const list = $("taskList");
    list.replaceChildren();
    members.forEach((name, i) => {
      const li = document.createElement("li");
      li.className = "task";
      const img = document.createElement("span");
      img.className = "portrait portrait-" + i;
      img.setAttribute("aria-hidden", "true");
      const strong = document.createElement("strong"),
        p = document.createElement("p");
      strong.textContent = name;
      p.textContent = state.tasks[i];
      li.append(img, strong, p);
      list.append(li);
    });
  }
  function renderWall() {
    const list = $("wall");
    list.replaceChildren();
    state.notes.forEach((note) => {
      const li = document.createElement("li");
      li.className = "idea-note";
      const img = document.createElement("span");
      img.className = "portrait portrait-0";
      img.setAttribute("aria-hidden", "true");
      const content = document.createElement("div");
      content.className = "idea-content";
      const name = document.createElement("strong");
      name.textContent = "Maya · Você";
      const date = document.createElement("time");
      date.dateTime = new Date(note.date).toISOString();
      date.textContent = new Date(note.date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      const text = document.createElement("p");
      text.textContent = note.text;
      content.append(name, date, text);
      const remove = document.createElement("button");
      remove.className = "remove-note";
      remove.setAttribute("aria-label", "Remover minha ideia");
      remove.textContent = "×";
      remove.onclick = () => {
        pendingRemove = note.id;
        open($("removeDialog"), remove);
      };
      li.append(img, content, remove);
      list.append(li);
    });
  }
  $("organize").onclick = () => {
    const fields = $("taskFields");
    fields.replaceChildren();
    members.forEach((name, i) => {
      const div = document.createElement("div"),
        label = document.createElement("label"),
        input = document.createElement("input");
      label.htmlFor = "task-" + i;
      label.textContent = name + (i === 0 ? " · Você" : "");
      input.id = "task-" + i;
      input.name = "task-" + i;
      input.required = true;
      input.maxLength = 120;
      input.value = state.tasks[i];
      div.append(label, input);
      fields.append(div);
    });
    $("taskError").textContent = "";
    open($("taskDialog"), $("organize"));
  };
  $("taskForm").onsubmit = (e) => {
    e.preventDefault();
    const tasks = members.map((_, i) => $("task-" + i).value.trim());
    const empty = tasks.findIndex((t) => !t);
    if (empty >= 0) {
      $("taskError").textContent =
        "Preencha cada responsabilidade ou escreva “A combinar”.";
      $("task-" + empty).focus();
      return;
    }
    state.tasks = tasks.map((t) => t.slice(0, 120));
    const saved = save();
    renderTasks();
    $("taskDialog").close();
    $("wallStatus").textContent = saved
      ? "Combinados salvos neste navegador."
      : "Combinados atualizados somente nesta visita.";
  };
  $("idea").oninput = () => {
    $("ideaCount").textContent = $("idea").value.length + " / 1000";
    $("formError").textContent = "";
  };
  $("ideaForm").onsubmit = (e) => {
    e.preventDefault();
    const text = $("idea").value.trim();
    if (!text) {
      $("formError").textContent = "Escreva uma ideia antes de adicionar.";
      $("idea").focus();
      return;
    }
    if (text.length > 1000) {
      $("formError").textContent = "Use até 1000 caracteres.";
      return;
    }
    if (state.notes.length >= 30) {
      $("formError").textContent =
        "Seu mural local chegou a 30 ideias. Remova uma anotação para adicionar outra.";
      return;
    }
    state.notes.push({
      id:
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
      text,
      date: Date.now(),
    });
    const saved = save();
    renderWall();
    $("idea").value = "";
    $("ideaCount").textContent = "0 / 1000";
    $("formError").textContent = "";
    $("wallStatus").textContent = saved
      ? "Ideia adicionada ao mural local."
      : "Ideia adicionada somente nesta visita.";
    $("idea").focus();
  };
  $("confirmRemove").onclick = () => {
    if (!pendingRemove) return;
    state.notes = state.notes.filter((n) => n.id !== pendingRemove);
    pendingRemove = null;
    const saved = save();
    renderWall();
    $("removeDialog").close();
    $("idea").focus();
    $("wallStatus").textContent = saved
      ? "Ideia removida do mural local."
      : "Ideia removida somente nesta visita.";
  };
  document
    .querySelectorAll("[data-close]")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((d) =>
    d.addEventListener("close", () => {
      if (opener?.isConnected) opener.focus();
      else $("idea").focus();
      if (d.id === "removeDialog") pendingRemove = null;
    }),
  );
  document.querySelectorAll("[data-soon]").forEach(
    (b) =>
      (b.onclick = () => {
        $("infoTitle").textContent = b.dataset.soon;
        $("infoText").textContent =
          "Esta área será uma próxima etapa. A biblioteca, as conquistas e a trilha já estão disponíveis.";
        open($("info"), b);
      }),
  );
  $("previewInfo").onclick = () => {
    $("infoTitle").textContent = "Prévia da equipe";
    $("infoText").textContent =
      "Os integrantes são exemplos. Tarefas, ideias e anexos ficam neste navegador e não são compartilhados com outros alunos ou enviados ao professor. A conexão com contas reais será uma próxima etapa.";
    open($("info"), $("previewInfo"));
  };
  $("helper").onclick = () => {
    $("infoTitle").textContent = "Como colaborar nesta missão";
    $("infoText").textContent =
      "Conversem antes de dividir as tarefas, deixem todos contribuir e revisem as decisões juntos. Aqui você pode testar a organização, mas os registros não são enviados aos colegas nesta prévia.";
    open($("info"), $("helper"));
  };
  renderMembers();
  renderTasks();
  renderWall();
})();
