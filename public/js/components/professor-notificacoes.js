/* Avisos dentro da plataforma: sem permissão de push, som ou alertas invasivos. */
(() => {
  "use strict";

  const D = window.TeacherData,
    bell = document.getElementById("noticeBell"),
    badge = document.getElementById("noticeCount");
  if (!bell || !D) return;
  const E = (tag, text = "", cls = "") => {
    const e = document.createElement(tag);
    e.textContent = text;
    e.className = cls;
    return e;
  };
  bell.setAttribute("aria-haspopup", "dialog");
  bell.setAttribute("aria-controls", "noticeDialog");
  bell.setAttribute("aria-expanded", "false");
  const dialog = E("dialog", "", "notice-dialog");
  dialog.id = "noticeDialog";
  dialog.setAttribute("aria-labelledby", "noticeTitle");
  const title = E("h2", "Sua caixa de avisos");
  title.id = "noticeTitle";
  const close = E("button", "×", "close");
  close.type = "button";
  close.setAttribute("aria-label", "Fechar notificações");
  const intro = E("p", "Novas entregas e perguntas das suas turmas.", "hint"),
    toolbar = E("div", "", "notice-toolbar"),
    filter = E("select"),
    refresh = E("button", "↻ Atualizar", "text-button"),
    mark = E("button", "Marcar exibidas como lidas", "text-button"),
    error = E("p", "", "error-panel"),
    list = E("div", "", "notice-list"),
    footer = E(
      "p",
      "Atualização a cada 30 segundos enquanto esta página estiver visível.",
      "hint",
    );
  error.setAttribute("role", "alert");
  filter.setAttribute("aria-label", "Filtrar notificações");
  [
    ["Não lidas", "unread"],
    ["Todas", "all"],
  ].forEach(([text, value]) => {
    const o = E("option", text);
    o.value = value;
    filter.append(o);
  });
  toolbar.append(filter, refresh, mark);
  const all = E("a", "Ver todas as notificações →", "secondary");
  all.href = "notificacoes.html";
  dialog.append(close, title, intro, toolbar, error, list, footer, all);
  document.body.append(dialog);
  const live = E("p", "", "notification-toast");
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  document.body.append(live);
  let rows = [],
    unread = 0,
    busy = false,
    initialized = false,
    seen = new Set(),
    latestSeen = 0,
    toastTimer = null,
    readBusy = false;
  function target(n) {
    const params = new URLSearchParams({
      sala: n.sala_id,
    });
    let route = "";
    if (n.tipo === "entrega") {
      route = "correcao/";
      params.set("entrega", n.entrega_id);
    } else {
      route = "perguntas/";
      params.set("pergunta", n.pergunta_id);
    }
    return (
      (route === "correcao/" ? "correcao.html" : "perguntas.html") +
      "?" +
      params
    );
  }
  function render() {
    const visible = rows.filter((n) => filter.value === "all" || !n.lida_em);
    list.replaceChildren();
    mark.disabled = readBusy || !visible.some((n) => !n.lida_em);
    for (const n of visible) {
      const row = E(
          "article",
          "",
          "notice-item" + (!n.lida_em ? " unread" : ""),
        ),
        a = E("a", "", "notice-link");
      a.href = target(n);
      const icon = E("span", n.tipo === "entrega" ? "✓" : "?", "notice-icon"),
        copy = E("div");
      copy.append(
        E("strong", n.titulo),
        E("p", n.mensagem),
        E(
          "small",
          new Date(n.criado_em).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
        ),
      );
      a.append(icon, copy);
      a.onclick = async (e) => {
        e.preventDefault();
        if (readBusy) return;
        readBusy = true;
        error.textContent = "";
        try {
          if (!n.lida_em) await D.readNotifications([n.id]);
          location.assign(a.href);
        } catch (err) {
          error.textContent = err.message;
        } finally {
          readBusy = false;
        }
      };
      row.append(a);
      if (n.lida_em) row.append(E("span", "Lida", "small-label"));
      list.append(row);
    }
    if (!visible.length)
      list.append(
        E(
          "p",
          filter.value === "all"
            ? "Nenhum aviso por enquanto."
            : "Tudo em dia. Nenhum aviso não lido.",
          "empty",
        ),
      );
  }
  async function update() {
    if (busy) return;
    busy = true;
    refresh.disabled = true;
    try {
      const result = await D.notifications(filter.value !== "all");
      if (
        !Array.isArray(result.notificacoes) ||
        !Number.isFinite(result.nao_lidas)
      )
        throw new Error("O servidor não confirmou os avisos.");
      rows = result.notificacoes;
      unread = result.nao_lidas;
      const fresh = rows.filter(
        (n) =>
          !n.lida_em &&
          !seen.has(n.id) &&
          new Date(n.criado_em).getTime() > latestSeen,
      );
      if (initialized && fresh.length) {
        live.textContent =
          fresh.length === 1
            ? fresh[0].titulo
            : `${fresh.length} novos avisos das suas turmas.`;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => (live.textContent = ""), 6000);
      }
      rows.forEach((n) => {
        seen.add(n.id);
        latestSeen = Math.max(latestSeen, new Date(n.criado_em).getTime() || 0);
      });
      initialized = true;
      badge.textContent = unread > 99 ? "99+" : String(unread);
      badge.hidden = unread === 0;
      bell.setAttribute("aria-label", `Notificações: ${unread} não lidas`);
      bell.title = `${unread} notificações não lidas`;
      bell.classList.remove("notice-unavailable");
      error.textContent = "";
      render();
    } catch (e) {
      error.textContent = e.message;
      bell.classList.add("notice-unavailable");
      bell.setAttribute(
        "aria-label",
        "Notificações indisponíveis. Abrir para tentar novamente.",
      );
      bell.title = "Não foi possível consultar os avisos.";
    } finally {
      busy = false;
      refresh.disabled = false;
    }
  }
  bell.onclick = async (e) => {
    e.preventDefault();
    dialog.showModal();
    bell.setAttribute("aria-expanded", "true");
    await update();
  };
  close.onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    bell.setAttribute("aria-expanded", "false");
    bell.focus();
  });
  refresh.onclick = update;
  filter.onchange = update;
  mark.onclick = async () => {
    if (readBusy) return;
    const ids = rows.filter((n) => !n.lida_em).map((n) => n.id);
    if (!ids.length) return;
    readBusy = true;
    mark.disabled = true;
    try {
      await D.readNotifications(ids);
      await update();
    } catch (e) {
      error.textContent = e.message;
    } finally {
      readBusy = false;
      render();
    }
  };
  const demo = E("details", "", "notice-demo");
  demo.append(E("summary", "Testar os avisos na prévia"));
  const copy = E(
      "p",
      "Simule uma entrega ou use a atividade do aluno. Os avisos são locais, sem comunicação com a escola.",
      "hint",
    ),
    simulate = E("button", "Simular nova entrega", "secondary"),
    student = E("a", "Abrir atividade do aluno ↗", "text-button");
  student.href = "../aluno/atividade.html?missao=1";
  simulate.onclick = async () => {
    simulate.disabled = true;
    try {
      await D.simulateDelivery();
      await update();
    } catch (e) {
      error.textContent = e.message;
    } finally {
      simulate.disabled = false;
    }
  };
  demo.append(copy, simulate, student);
  dialog.append(demo);
  const timer = setInterval(() => {
    if (!document.hidden) update();
  }, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) update();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "astrolearn-professor-v2") update();
  });
  window.addEventListener("astro-notifications-refresh", update);
  window.addEventListener("pagehide", () => {
    clearInterval(timer);
    clearTimeout(toastTimer);
  });
  update();
})();
