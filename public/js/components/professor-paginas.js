/* Páginas separadas: turmas → sala → aluno / atividades / equipes / correções. */
(() => {
  "use strict";

  const D = window.TeacherData,
    $ = (id) => document.getElementById(id),
    params = new URLSearchParams(location.search),
    page = document.body.dataset.page,
    roomId = params.get("sala");
  let detail = null,
    rooms = [],
    lastFocus = null,
    dialogBusy = false,
    renderToken = 0,
    dialogVersion = 0;
  const objectURLs = [];
  const E = (tag, value = "", className = "") => {
    const e = document.createElement(tag);
    e.textContent = value;
    e.className = className;
    return e;
  };
  const append = (parent, ...children) => {
    parent.append(...children);
    return parent;
  };
  const url = (route, values = {}) => {
    const query = new URLSearchParams(values);
    if (values.sala && params.get("periodo"))
      query.set("periodo", params.get("periodo"));
    const routes = {
      "": "home.html",
      "sala/": "turma.html",
      "aluno/": "aluno.html",
      "atividade/": "atividade.html",
      "atividade/nova/": "editor-atividade.html",
      "atividade/editar/": "editor-atividade.html",
      "atividades/": "atividades.html",
      "equipes/": "equipes.html",
      "correcoes/": "correcoes.html",
      "correcao/": "correcao.html",
      "perguntas/": "perguntas.html",
      "notificacoes/": "notificacoes.html",
    };
    return `${routes[route] || "home.html"}${query.size ? "?" + query : ""}`;
  };
  const link = (label, route, values = {}, cls = "secondary") => {
    const a = E("a", label, cls);
    a.href = url(route, values);
    return a;
  };
  const button = (label, fn, cls = "secondary") => {
    const b = E("button", label, cls);
    b.type = "button";
    b.onclick = fn;
    return b;
  };
  const err = (e) => ($("error").textContent = e.message || String(e));
  const grade = (n) =>
    n === null || n === undefined || n === "" || !Number.isFinite(Number(n))
      ? null
      : Number(n);
  const fmt = (n) =>
    n === null
      ? "—"
      : Number(n).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        });
  const heading = (title, subtitle) => {
    $("pageTitle").textContent = title;
    $("pageSubtitle").textContent = subtitle;
    document.title = `${title} · AstroLearn`;
  };
  const panel = (title, subtitle = "") => {
    const p = E("section", "", "panel");
    p.append(E("h2", title));
    if (subtitle) p.append(E("p", subtitle));
    return p;
  };
  const stat = (label, value) =>
    append(E("div", "", "card stat"), E("span", label), E("strong", value));
  function clearURLs() {
    objectURLs.splice(0).forEach((u) => URL.revokeObjectURL(u));
  }
  function close() {
    if (!dialogBusy) $("actionDialog").close();
  }
  $("closeDialog").onclick = close;
  $("actionDialog").addEventListener("cancel", (e) => {
    if (dialogBusy) e.preventDefault();
  });
  $("actionDialog").addEventListener("close", () => {
    dialogVersion++;
    lastFocus?.focus();
  });
  function dialog(title, content) {
    dialogVersion++;
    lastFocus = document.activeElement;
    $("dialogTitle").textContent = title;
    $("dialogContent").replaceChildren(content);
    $("dialogError").textContent = "";
    $("actionDialog").showModal();
  }
  async function saving(fn) {
    if (dialogBusy) return;
    dialogBusy = true;
    $("closeDialog").disabled = true;
    try {
      await fn();
    } catch (e) {
      $("dialogError").textContent = e.message;
    } finally {
      dialogBusy = false;
      $("closeDialog").disabled = false;
    }
  }
  function formField(form, label, type = "text", name = "", value = "") {
    const id = `field-${name || D.uid()}`,
      labelEl = E("label", label);
    labelEl.htmlFor = id;
    const input =
      type === "textarea"
        ? E("textarea")
        : type === "select"
          ? E("select")
          : E("input");
    input.id = id;
    input.name = name;
    if (type !== "textarea" && type !== "select") input.type = type;
    input.value = value;
    if (type === "textarea") input.rows = 5;
    form.append(labelEl, input);
    return input;
  }
  function option(select, label, value) {
    const o = E("option", label);
    o.value = value;
    select.append(o);
  }
  function table(headers, rows) {
    const wrap = E("div", "", "table-wrap"),
      t = E("table"),
      head = E("thead"),
      tr = E("tr");
    headers.forEach((h) => {
      const th = E("th", h);
      th.scope = "col";
      tr.append(th);
    });
    head.append(tr);
    t.append(head);
    const body = E("tbody");
    rows.forEach((row) => {
      const tr = E("tr");
      row.forEach((value) => {
        const cell = E("td");
        cell.append(
          value instanceof Node
            ? value
            : document.createTextNode(String(value)),
        );
        tr.append(cell);
      });
      body.append(tr);
    });
    t.append(body);
    wrap.append(t);
    return wrap;
  }
  function bars(title, values, note) {
    const p = panel(title, note);
    values.forEach((v, i) => {
      const row = E("div", "", "bar-row"),
        track = E("div", "", "bar-track"),
        fill = E("div", "", "bar-fill");
      fill.style.width = Math.max(0, Math.min(100, v.percent || 0)) + "%";
      fill.setAttribute("aria-hidden", "true");
      track.append(fill);
      row.append(E("span", v.label), track, E("strong", String(v.value)));
      p.append(row);
    });
    return p;
  }
  function trend(
    title,
    values,
    note = "Escala de 0 a 10. Atividades sem nota permanecem sem ponto.",
  ) {
    const p = panel(title, note);
    p.classList.add("chart");
    const ns = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 620 210");
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      title +
        ". " +
        values
          .map(
            (v, i) =>
              `Atividade ${i + 1}: ${v.value == null ? "sem nota" : fmt(v.value)}`,
          )
          .join("; "),
    );
    svg.classList.add("chart-svg");
    const node = (tag, attrs) => {
      const n = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      return n;
    };
    [0, 5, 10].forEach((n) => {
      const y = 175 - n * 15;
      svg.append(
        node("line", {
          x1: 38,
          x2: 595,
          y1: y,
          y2: y,
          class: "grid",
        }),
      );
      const text = node("text", {
        x: 15,
        y: y + 4,
      });
      text.textContent = n;
      svg.append(text);
    });
    let last = null;
    values.forEach((v, i) => {
      const x = values.length < 2 ? 315 : 48 + (i * 535) / (values.length - 1),
        n = grade(v.value);
      if (n != null) {
        const y = 175 - Math.max(0, Math.min(10, n)) * 15;
        if (last)
          svg.append(
            node("line", {
              x1: last.x,
              y1: last.y,
              x2: x,
              y2: y,
              class: "trend",
            }),
          );
        const circle = node("circle", {
            cx: x,
            cy: y,
            r: 5,
          }),
          tip = node("title", {});
        tip.textContent = `${v.label}: ${fmt(n)}`;
        circle.append(tip);
        svg.append(circle);
        last = {
          x,
          y,
        };
      } else last = null;
      const text = node("text", {
        x,
        y: 199,
        "text-anchor": "middle",
      });
      text.textContent = i + 1;
      svg.append(text);
    });
    p.append(svg);
    const details = E("details");
    details.append(
      E("summary", "Ver atividades e valores"),
      table(
        ["Atividade", "Nota"],
        values.map((v) => [v.label, fmt(grade(v.value))]),
      ),
    );
    p.append(details);
    if (!values.some((v) => grade(v.value) != null))
      p.append(
        E(
          "p",
          "Ainda não há notas registradas para este gráfico.",
          "chart-caption",
        ),
      );
    return p;
  }
  function results(data) {
    const missionIds = new Set(
        data.missoes
          .filter((m) => m.status_publicacao !== "rascunho")
          .map((m) => m.id),
      ),
      students = new Set(data.alunos.map((a) => a.id)),
      work = new Map();
    for (const e of data.entregas)
      if (
        missionIds.has(e.missao_id) &&
        students.has(e.aluno_id || e.perfis?.id) &&
        !work.has(`${e.aluno_id || e.perfis?.id}-${e.missao_id}`)
      )
        work.set(`${e.aluno_id || e.perfis?.id}-${e.missao_id}`, e);
    const entries = [...work.values()],
      total = missionIds.size * students.size,
      corrected = entries.filter((e) => e.status === "corrigido").length,
      pending = entries.filter((e) => e.status === "entregue").length;
    return {
      total,
      corrected,
      pending,
      missing: Math.max(0, total - corrected - pending),
    };
  }
  const published = (data) =>
    data.missoes.filter((m) => m.status_publicacao !== "rascunho");
  function averages(data) {
    return published(data).map((m) => {
      const numbers = (data.pauta.pauta_data || [])
        .map((r) => grade(r.notas?.[m.id]))
        .filter((n) => n !== null);
      return {
        label:
          (data.periodos.find((p) => p.id === m.periodo_id)?.nome ||
            "Período") +
          " · " +
          m.titulo,
        value: numbers.length
          ? numbers.reduce((a, b) => a + b, 0) / numbers.length
          : null,
      };
    });
  }
  function deliveryChart(data) {
    const s = results(data),
      scale = s.total || 1;
    return bars(
      "Situação das atividades",
      [
        {
          label: "Corrigidas",
          value: s.corrected,
          percent: (s.corrected / scale) * 100,
        },
        {
          label: "A corrigir",
          value: s.pending,
          percent: (s.pending / scale) * 100,
        },
        {
          label: "Sem entrega",
          value: s.missing,
          percent: (s.missing / scale) * 100,
        },
      ],
      "Contagem por aluno e atividade cadastrada. Inclui atividades futuras; não representa atraso.",
    );
  }
  function nav() {
    const items = [
      ["rooms", "Turmas", "", {}, "M3 5h18v16H3ZM7 9h3m4 0h3M7 14h3m4 0h3"],
    ];
    if (roomId)
      items.push(
        [
          "room",
          "Sala",
          "sala/",
          {
            sala: roomId,
          },
          "M3 10 12 3l9 7v10H3Zm6 10v-7h6v7",
        ],
        [
          "activities",
          "Atividades",
          "atividades/",
          {
            sala: roomId,
          },
          "M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5",
        ],
        [
          "teams",
          "Equipes",
          "equipes/",
          {
            sala: roomId,
          },
          "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a4 4 0 0 1 0 8m2 2a6 6 0 0 1 3 5v2",
        ],
        [
          "corrections",
          "Correções",
          "correcoes/",
          {
            sala: roomId,
          },
          "M8 3H4v18h16V3h-4M8 2h8v4H8Zm0 11 3 3 5-6",
        ],
      );
    if (roomId)
      items.push([
        "questions",
        "Perguntas",
        "perguntas/",
        {
          sala: roomId,
        },
        "M3 4h18v13H8l-5 4Zm4 4h10M7 12h6",
      ]);
    items.push([
      "notifications",
      "Notificações",
      "notificacoes/",
      {},
      "M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4",
    ]);
    $("mainNav").replaceChildren();
    for (const [key, label, route, values, path] of items) {
      const a = link("", route, values, "");
      a.setAttribute("aria-label", label);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const p = document.createElementNS(svg.namespaceURI, "path");
      p.setAttribute("d", path);
      svg.append(p);
      a.append(svg, E("span", label, "label"));
      if (
        key === page ||
        (key === "room" && page === "student") ||
        (key === "activities" && ["activity", "create"].includes(page)) ||
        (key === "corrections" && page === "review")
      ) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      $("mainNav").append(a);
    }
    $("brandHome").href = url("");
  }
  $("menuToggle").onclick = () => {
    const collapsed = document.body.classList.toggle("collapsed");
    $("menuToggle").setAttribute("aria-expanded", String(!collapsed));
    $("menuToggle").setAttribute(
      "aria-label",
      collapsed ? "Expandir menu" : "Recolher menu",
    );
  };
  $("help").onclick = () => {
    const copy = E("div");
    copy.append(
      E(
        "p",
        "Comece em Turmas. Ao abrir uma sala, consulte os alunos e gráficos. Use Atividades para criar uma proposta com PDF ou imagem, Equipes para organizar os grupos e Correções para revisar as entregas.",
      ),
      E(
        "p",
        "Os gráficos mostram apenas dados registrados. Sem nota significa que a atividade ainda não recebeu uma avaliação.",
      ),
      E(
        "p",
        "Esta é uma prévia local. Nenhuma turma ou correção é enviada à escola.",
      ),
    );
    dialog("Sua estação de aprendizagem", copy);
  };
  $("exit").onclick = async (e) => {
    e.preventDefault();
    location.assign("../auth/login.html");
  };
  $("topExit").onclick = () => $("exit").click();
  async function renderRooms(token) {
    heading(
      "Suas turmas.",
      "Cada sala, uma nova expedição. Escolha uma turma para acompanhar os alunos.",
    );
    $("pageActions").append(
      button(
        "+ Criar turma",
        () =>
          simpleCreate("Criar turma", "Nome da turma", async (nome) => {
            const r = await D.createRoom(nome);
            location.assign(
              url("sala/", {
                sala: r.id,
              }),
            );
          }),
        "primary",
      ),
    );
    const pairs = await Promise.all(
      rooms.map(async (room) => ({
        room,
        data: await D.room(room.id),
      })),
    );
    if (token !== renderToken) return;
    const grid = E("div", "", "room-grid");
    pairs.forEach(({ room, data }) => {
      const card = E("article", "", "card room-card"),
        art = E("div", "", "room-art");
      art.setAttribute("aria-hidden", "true");
      art.append(E("span", "EXPEDIÇÃO STEAM"), E("span", "", "room-planet"));
      const body = E("div", "", "room-body"),
        s = results(data);
      body.append(
        E("h2", room.nome),
        E(
          "p",
          `${data.alunos.length} alunos · ${published(data).length} publicadas · ${data.missoes.length - published(data).length} rascunhos`,
        ),
      );
      const row = E("div", "", "room-data");
      row.append(
        append(E("div"), E("strong", s.pending), E("span", "a corrigir")),
        append(E("div"), E("strong", s.corrected), E("span", "corrigidas")),
      );
      body.append(row);
      const chart = E("div", "", "mini-chart");
      const points = averages(data);
      points.forEach((v) => {
        const bar = E("div");
        bar.style.height =
          (v.value == null ? 0 : Math.max(2, v.value * 4)) + "px";
        if (v.value == null) {
          bar.style.background = "transparent";
          bar.style.minHeight = "0";
        }
        bar.title = `${v.label}: ${fmt(v.value)}`;
        bar.append(E("span", fmt(v.value)));
        chart.append(bar);
      });
      chart.setAttribute("role", "img");
      chart.setAttribute(
        "aria-label",
        "Médias das atividades: " +
          points.map((v) => `${v.label}: ${fmt(v.value)}`).join("; "),
      );
      body.append(
        chart,
        E("p", "Médias por atividade · escala 0–10", "mini-label"),
        link(
          "Entrar na turma →",
          "sala/",
          {
            sala: room.id,
          },
          "primary",
        ),
      );
      card.append(art, body);
      grid.append(card);
    });
    $("content").append(grid);
    if (!rooms.length)
      $("content").append(
        E("p", "Você ainda não tem turmas. Crie sua primeira sala.", "empty"),
      );
  }
  function simpleCreate(title, label, callback) {
    const f = E("form"),
      input = formField(f, label);
    input.required = true;
    input.maxLength = 80;
    const save = E("button", "Confirmar", "primary");
    save.type = "submit";
    f.append(
      E("p", "A criação fica apenas na prévia deste navegador.", "hint"),
      save,
    );
    f.onsubmit = (e) => {
      e.preventDefault();
      if (!input.value.trim()) return;
      saving(async () => {
        save.disabled = true;
        try {
          await callback(input.value.trim());
        } finally {
          save.disabled = false;
        }
      });
    };
    dialog(title, f);
  }
  function periodFilter() {
    if (
      !["room", "student", "activities", "teams", "corrections"].includes(
        page,
      ) ||
      !detail.periodos.length
    )
      return;
    const selected = params.get("periodo") || "",
      select = E("select");
    select.setAttribute("aria-label", "Filtrar por período");
    option(select, "Todos os períodos", "");
    detail.periodos.forEach((p) => option(select, p.nome, p.id));
    select.value = selected;
    select.onchange = () => {
      if (select.value) params.set("periodo", select.value);
      else params.delete("periodo");
      history.replaceState(null, "", location.pathname + "?" + params);
      load();
    };
    $("pageActions").append(select);
    const periodOrder = new Map(
      (detail.pauta.periodos || detail.periodos).map((p, i) => [p.id, i]),
    );
    detail.missoes = [...detail.missoes].sort(
      (a, b) =>
        (periodOrder.get(a.periodo_id) || 0) -
          (periodOrder.get(b.periodo_id) || 0) ||
        (Number(a.ordem) || 0) - (Number(b.ordem) || 0),
    );
    if (!selected) return;
    if (!detail.periodos.some((p) => p.id === selected))
      throw new Error("Período não encontrado nesta turma.");
    detail.missoes = detail.missoes.filter((m) => m.periodo_id === selected);
    const ids = new Set(detail.missoes.map((m) => m.id));
    detail.entregas = detail.entregas.filter((e) => ids.has(e.missao_id));
    detail.equipes = detail.equipes.filter((t) => t.periodo_id === selected);
    detail.pauta = {
      ...detail.pauta,
      pauta_data: detail.pauta.pauta_data.map((r) => {
        let total = 0,
          weight = 0;
        detail.missoes.forEach((m) => {
          const value = grade(r.notas?.[m.id]);
          if (value !== null) {
            const w = Number(m.peso_nota) || 1;
            total += value * w;
            weight += w;
          }
        });
        return {
          ...r,
          media_missoes: weight ? total / weight : null,
          media: weight ? total / weight : null,
        };
      }),
    };
  }
  function breadcrumbs() {
    const p = $("breadcrumbs");
    p.replaceChildren(link("Turmas", "", {}, ""));
    if (detail) {
      p.append(
        E("span", "/"),
        link(
          detail.sala.nome,
          "sala/",
          {
            sala: roomId,
          },
          "",
        ),
      );
      if (page !== "room")
        p.append(
          E("span", "/"),
          E(
            "span",
            {
              student: "Aluno",
              activities: "Atividades",
              activity: "Atividade",
              create: "Nova atividade",
              teams: "Equipes",
              corrections: "Correções",
              review: "Corrigir entrega",
              questions: "Perguntas",
            }[page],
          ),
        );
    }
  }
  function roomActions() {
    return [
      link(
        "+ Criar atividade",
        "atividade/nova/",
        {
          sala: roomId,
        },
        "primary",
      ),
      link("Organizar equipes", "equipes/", {
        sala: roomId,
      }),
      link("Revisar entregas", "correcoes/", {
        sala: roomId,
      }),
    ];
  }
  function renderRoom() {
    heading(
      detail.sala.nome,
      "Uma visão da turma para orientar a próxima descoberta.",
    );
    $("pageActions").append(...roomActions());
    const s = results(detail);
    $("content").append(
      append(
        E("section", "", "stats"),
        stat("Alunos cadastrados", detail.alunos.length),
        stat("Atividades publicadas", published(detail).length),
        stat("Aguardando correção", s.pending),
      ),
    );
    const columns = E("div", "", "two-columns"),
      students = panel(
        "Alunos cadastrados",
        "Abra o aluno para consultar notas, entregas e seu desenvolvimento.",
      ),
      input = E("input");
    input.type = "search";
    input.placeholder = "Buscar aluno…";
    input.setAttribute("aria-label", "Buscar aluno da turma");
    const list = E("div");
    students.id = "alunos";
    students.append(input, list);
    const roster = () => {
      const q = input.value.toLocaleLowerCase("pt-BR"),
        data = detail.alunos.filter((a) =>
          a.nome.toLocaleLowerCase("pt-BR").includes(q),
        );
      list.replaceChildren(
        table(
          ["Aluno", "Média de atividades", "Entregas", ""],
          data.map((a) => {
            const row = detail.pauta.pauta_data.find(
                (p) => p.aluno.id === a.id,
              ),
              work = detail.entregas.filter(
                (e) => (e.aluno_id || e.perfis?.id) === a.id,
              );
            const name = append(
              E("div", "", "cell-name"),
              E("span", a.nome.slice(0, 1), "initial"),
              E("span", a.nome),
            );
            return [
              name,
              fmt(grade(row?.media_missoes ?? row?.media)),
              `${work.length}/${published(detail).length}`,
              link(
                "Ver aluno →",
                "aluno/",
                {
                  sala: roomId,
                  aluno: a.id,
                },
                "",
              ),
            ];
          }),
        ),
      );
      if (!data.length)
        list.append(E("p", "Nenhum aluno encontrado.", "empty"));
    };
    input.oninput = roster;
    roster();
    const graphs = E("div", "", "stack");
    graphs.append(
      trend(
        "Notas da turma por atividade",
        averages(detail),
        "Média apenas das notas registradas em cada atividade. Escala de 0 a 10.",
      ),
      deliveryChart(detail),
    );
    columns.append(students, graphs);
    $("content").append(columns);
    const code = E("div", "", "room-code");
    code.append(
      E("span", "Código da turma"),
      E("strong", detail.sala.codigo_acesso || "—"),
      button(
        "Copiar código",
        async () => {
          try {
            await navigator.clipboard.writeText(detail.sala.codigo_acesso);
            $("status").textContent = "Código copiado.";
          } catch {
            $("status").textContent = "Selecione o código para copiá-lo.";
          }
        },
        "text-button",
      ),
      button(
        "+ Criar período",
        () =>
          simpleCreate("Criar período", "Nome do período", async (nome) => {
            await D.createPeriod(roomId, nome);
            $("actionDialog").close();
            await load();
          }),
        "text-button",
      ),
    );
    $("content").append(code);
  }
  function renderStudent() {
    const id = params.get("aluno"),
      student = detail.alunos.find((a) => a.id === id);
    if (!student)
      throw new Error("Este aluno não pertence à turma selecionada.");
    heading(
      student.nome,
      "Acompanhamento individual: atividades, notas e retorno do professor.",
    );
    const row = detail.pauta.pauta_data.find((r) => r.aluno.id === id),
      work = detail.entregas.filter((e) => (e.aluno_id || e.perfis?.id) === id),
      corrected = work.filter((e) => e.status === "corrigido");
    $("content").append(
      append(
        E("section", "", "stats"),
        stat(
          "Média das atividades",
          fmt(grade(row?.media_missoes ?? row?.media)),
        ),
        stat(
          "Entregas registradas",
          `${work.length}/${published(detail).length}`,
        ),
        stat("Atividades corrigidas", corrected.length),
      ),
    );
    const points = published(detail).map((m) => ({
        label:
          (detail.periodos.find((p) => p.id === m.periodo_id)?.nome ||
            "Período") +
          " · " +
          m.titulo,
        value: grade(row?.notas?.[m.id]),
      })),
      columns = E("div", "", "two-columns");
    columns.append(
      trend("Notas por atividade", points),
      bars(
        "Situação individual",
        [
          {
            label: "Corrigidas",
            value: corrected.length,
            percent: (corrected.length / (published(detail).length || 1)) * 100,
          },
          {
            label: "A corrigir",
            value: work.filter((e) => e.status === "entregue").length,
            percent:
              (work.filter((e) => e.status === "entregue").length /
                (published(detail).length || 1)) *
              100,
          },
          {
            label: "Sem entrega",
            value: Math.max(0, published(detail).length - work.length),
            percent:
              (Math.max(0, published(detail).length - work.length) /
                (published(detail).length || 1)) *
              100,
          },
        ],
        "Atividades sem avaliação não entram na média.",
      ),
    );
    $("content").append(columns);
    const history = panel(
      "Histórico de atividades",
      "A nota e a orientação pertencem a cada atividade, não a um rótulo do aluno.",
    );
    history.style.marginTop = "20px";
    history.append(
      table(
        ["Atividade", "Situação", "Nota", "Retorno", ""],
        published(detail).map((m) => {
          const e = work.find((e) => e.missao_id === m.id);
          return [
            m.titulo,
            e
              ? e.status === "corrigido"
                ? "Corrigida"
                : "A corrigir"
              : "Sem entrega",
            fmt(grade(e?.nota)),
            e?.comentario_professor || "—",
            e
              ? link(
                  "Abrir entrega",
                  "correcao/",
                  {
                    sala: roomId,
                    entrega: e.id,
                  },
                  "text-button",
                )
              : "—",
          ];
        }),
      ),
    );
    $("content").append(history);
  }
  function renderActivities() {
    heading(
      "Atividades da turma.",
      "Rascunhos para preparar. Publicadas para os alunos descobrirem.",
    );
    $("pageActions").append(
      link(
        "+ Criar atividade",
        "atividade/nova/",
        {
          sala: roomId,
        },
        "primary",
      ),
    );
    const filter = E("select");
    filter.setAttribute("aria-label", "Situação da atividade");
    option(filter, "Todas as atividades", "");
    option(filter, "Rascunhos", "rascunho");
    option(filter, "Publicadas", "publicado");
    $("pageActions").append(filter);
    const list = E("div", "", "list");
    $("content").append(list);
    const render = () => {
      list.replaceChildren();
      for (const m of detail.missoes.filter(
        (m) =>
          !filter.value ||
          (m.status_publicacao || "publicado") === filter.value,
      )) {
        const draft = m.status_publicacao === "rascunho",
          row = E("article", "", "list-card"),
          copy = E("div");
        copy.append(
          E(
            "span",
            draft ? "Rascunho · só o professor" : "Publicada",
            draft ? "badge" : "badge green",
          ),
          E("h2", m.titulo),
          E(
            "p",
            `${detail.periodos.find((p) => p.id === m.periodo_id)?.nome || "Sem período"} · ${m.tipo_atividade === "equipe" ? "Em equipe" : "Individual"} · Atividade ${m.ordem}${m.data_limite ? " · Prazo " + new Date(m.data_limite.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR") : ""}`,
          ),
        );
        row.append(
          copy,
          link(
            draft ? "Continuar rascunho →" : "Abrir atividade →",
            draft ? "atividade/editar/" : "atividade/",
            {
              sala: roomId,
              atividade: m.id,
            },
          ),
        );
        list.append(row);
      }
      if (!list.children.length)
        list.append(
          E("p", "Nenhuma atividade corresponde a este filtro.", "empty"),
        );
    };
    filter.onchange = render;
    render();
  }
  function safeDownload(file) {
    const a = E("a", file.name || "Arquivo");
    if (file.blob instanceof Blob) {
      a.href = URL.createObjectURL(file.blob);
      objectURLs.push(a.href);
      a.download = file.name;
    } else {
      try {
        const u = new URL(file.url);
        if (u.protocol !== "https:") return null;
        a.href = u.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      } catch {
        return null;
      }
    }
    return a;
  }
  async function renderActivity(token) {
    const m = detail.missoes.find((m) => m.id === params.get("atividade"));
    if (!m) throw new Error("Atividade não encontrada nesta sala.");
    heading(
      m.titulo,
      m.status_publicacao === "rascunho"
        ? "Rascunho privado do professor."
        : "Orientação e materiais publicados para esta turma.",
    );
    $("pageActions").append(
      link(
        "Editar proposta",
        "atividade/editar/",
        {
          sala: roomId,
          atividade: m.id,
        },
        "primary",
      ),
    );
    const preview = E("a", "Ver como aluno", "secondary");
    preview.href = previewUrl(m);
    $("pageActions").append(preview);
    $("pageActions").append(
      link(
        "Ver entregas",
        "correcoes/",
        {
          sala: roomId,
          atividade: m.id,
        },
        "primary",
      ),
      link("Voltar às atividades", "atividades/", {
        sala: roomId,
      }),
    );
    const p = panel("Orientação da atividade");
    p.append(
      E("p", m.descricao || "Sem orientação cadastrada.", "document-copy"),
    );
    const materials = panel(
      "PDFs e imagens da atividade",
      "Arquivos do professor para apoiar a investigação.",
    );
    const list = E("ul", "", "files-list");
    materials.append(list);
    $("content").append(append(E("div", "", "two-columns"), p, materials));
    try {
      const files = await D.files(roomId, m.id);
      if (token !== renderToken) return;
      files.forEach((f) => {
        const a = safeDownload(f);
        if (a)
          list.append(
            append(
              E("li"),
              a,
              E("span", `${Math.ceil((f.size || 0) / 1024)} KB`, "small-label"),
            ),
          );
      });
      if (!files.length) list.append(E("li", "Nenhum arquivo anexado."));
    } catch (e) {
      materials.append(E("p", e.message, "hint"));
    }
    const upload = E("form"),
      input = formField(
        upload,
        "Adicionar PDF ou imagem",
        "file",
        "extra-files",
      );
    input.multiple = true;
    input.accept = ".pdf,.jpg,.jpeg,.png,.webp";
    const save = E("button", "Adicionar materiais", "secondary");
    save.type = "submit";
    upload.append(
      E("p", "Até 10 arquivos, 20 MB por arquivo e 50 MB no total.", "hint"),
      save,
    );
    upload.onsubmit = async (e) => {
      e.preventDefault();
      save.disabled = true;
      try {
        const files = validateFiles(input.files);
        if (!files.length) throw new Error("Escolha pelo menos um arquivo.");
        await D.attach(roomId, m.id, files);
        $("status").textContent = "Materiais salvos na prévia local.";
        await load();
      } catch (e) {
        err(e);
      } finally {
        save.disabled = false;
      }
    };
    materials.append(upload);
  }
  function validateFiles(files) {
    const result = Array.from(files || []),
      MB = 1024 * 1024;
    if (result.length > 10) throw new Error("Anexe até 10 arquivos.");
    if (
      new Set(result.map((f) => f.name + "-" + f.size)).size !== result.length
    )
      throw new Error("Um dos arquivos foi selecionado mais de uma vez.");
    let total = 0;
    for (const f of result) {
      if (!/\.(pdf|jpe?g|png|webp)$/i.test(f.name))
        throw new Error(`${f.name}: escolha PDF, JPG, PNG ou WebP.`);
      if (!f.size || f.size > 20 * MB)
        throw new Error(
          `${f.name}: o arquivo deve ter até 20 MB e não pode estar vazio.`,
        );
      total += f.size;
    }
    if (total > 50 * MB) throw new Error("Os anexos ultrapassam 50 MB.");
    return result;
  }
  let editorDirty = false;
  const previewUrl = (m) =>
    "../aluno/atividade.html?" +
    new URLSearchParams({
      preview: "1",
      sala: roomId,
      atividade: m.id,
      ...{},
    });
  async function renderCreate() {
    await D.editorReady();
    const id = params.get("atividade") || params.get("criada"),
      creationKey = params.get("preparar") || D.uid();
    let model = id
      ? detail.missoes.find((m) => m.id === id)
      : detail.missoes.find((m) => m.chave_criacao === creationKey);
    if (id && !model) throw new Error("Atividade não encontrada nesta turma.");
    heading(
      model ? "Preparar a próxima descoberta." : "Uma nova descoberta.",
      model?.status_publicacao === "publicado"
        ? "As alterações salvas ficam visíveis para os alunos."
        : "Prepare com calma. O rascunho só fica visível para o professor.",
    );
    $("pageActions").append(
      link("← Atividades da turma", "atividades/", {
        sala: roomId,
      }),
    );
    const grid = E("div", "", "editor-grid"),
      p = panel("Proposta da atividade"),
      form = E("form");
    form.id = "missionForm";
    p.append(form);
    p.classList.add("form-panel");
    const title = formField(
      form,
      "Título da atividade",
      "text",
      "mission-title",
      model?.titulo || "",
    );
    title.required = true;
    title.maxLength = 120;
    title.placeholder = "Ex.: Como a luz influencia uma planta?";
    const description = formField(
      form,
      "Orientação para os alunos",
      "textarea",
      "mission-description",
      model?.descricao || "",
    );
    description.maxLength = 10000;
    description.rows = 9;
    description.placeholder =
      "Explique o objetivo, os passos e o que deve aparecer na entrega.";
    const row = E("div", "", "form-row"),
      period = formField(row, "Período", "select", "mission-period"),
      date = formField(
        row,
        "Prazo de entrega (opcional)",
        "date",
        "mission-date",
        model?.data_limite?.slice(0, 10) || "",
      );
    detail.periodos.forEach((p) => option(period, p.nome, p.id));
    period.value =
      model?.periodo_id ||
      params.get("periodo") ||
      detail.periodos[0]?.id ||
      "";
    period.required = true;
    form.append(row);
    const mode = formField(
      form,
      "Formato da proposta",
      "select",
      "mission-mode",
    );
    option(mode, "Individual", "individual");
    option(mode, "Em equipe", "equipe");
    mode.value = model?.tipo_atividade || "individual";
    const modeHelp = E("p", "", "hint");
    form.append(modeHelp);
    const teamsLink = link(
      "Organizar equipes deste período →",
      "equipes/",
      {
        sala: roomId,
      },
      "text-button",
    );
    form.append(teamsLink);
    const criteria = E("details", "", "orientation");
    criteria.append(E("summary", "Nota e recompensas"));
    const cr = E("div", "", "form-row"),
      weight = formField(
        cr,
        "Peso da nota",
        "number",
        "mission-weight",
        model?.peso_nota ?? 1,
      ),
      xp = formField(
        cr,
        "XP da atividade",
        "number",
        "mission-xp",
        model?.xp_reward ?? 30,
      );
    weight.min = ".1";
    weight.max = "10";
    weight.step = ".1";
    xp.min = "0";
    xp.max = "1000";
    xp.step = "1";
    criteria.append(
      cr,
      E(
        "p",
        "O período permite até 5 atividades, contando rascunhos. A ordem é definida automaticamente.",
        "hint",
      ),
    );
    form.append(criteria);
    const material = E("div", "", "editor-materials");
    material.append(
      E("h2", "Materiais de apoio"),
      E("p", "Anexe a proposta, uma imagem ou um roteiro em PDF.", "hint"),
    );
    const existingList = E("ul", "", "files-list"),
      input = formField(
        material,
        "Escolher PDFs ou imagens",
        "file",
        "mission-files",
      );
    input.multiple = true;
    input.accept = ".pdf,.jpg,.jpeg,.png,.webp";
    const pendingList = E("ul", "", "files-list");
    material.append(
      existingList,
      pendingList,
      E("p", "Até 10 arquivos · 20 MB por arquivo · 50 MB no total.", "hint"),
    );
    form.append(material);
    let existing = model ? await D.files(roomId, model.id) : [],
      chosen = [],
      removed = new Set(),
      busy = false;
    const notice = E("p", "", "file-note");
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    const errors = E("p", "", "error-panel");
    errors.setAttribute("role", "alert");
    form.append(notice, errors);
    const actions = E("div", "", "editor-actions"),
      save = E("button", "Salvar rascunho", "secondary"),
      see = button("Ver como aluno", () => perform("preview"), "secondary"),
      publish = button(
        "Revisar e publicar",
        () => perform("publish"),
        "primary",
      );
    save.type = "submit";
    save.id = "saveDraft";
    see.id = "previewMission";
    publish.id = "publishMission";
    actions.append(save, see, publish);
    form.append(actions);
    const summary = panel(
      "Antes de compartilhar.",
      "Uma proposta clara ajuda o aluno a começar.",
    );
    summary.classList.add("editor-summary");
    const badge = E("span", "", "badge"),
      summaryTitle = E("h3"),
      summaryText = E("div", "", "editor-summary-lines");
    summary.append(
      badge,
      summaryTitle,
      summaryText,
      E(
        "p",
        "Na prévia, tudo fica neste navegador. Nenhum aluno real receberá a atividade.",
        "hint",
      ),
    );
    grid.append(p, summary);
    $("content").append(grid);
    function sync() {
      const published = model?.status_publicacao === "publicado",
        team = mode.value === "equipe";
      save.textContent = published ? "Salvar alterações" : "Salvar rascunho";
      publish.hidden = published;
      badge.textContent = published ? "Publicada" : "Rascunho · só o professor";
      badge.className = published ? "badge green" : "badge";
      summaryTitle.textContent = title.value.trim() || "Sua próxima atividade";
      summaryText.replaceChildren(
        E("p", team ? "Em equipe · entrega individual" : "Individual"),
        E(
          "p",
          detail.periodos.find((p) => p.id === period.value)?.nome ||
            "Escolha um período",
        ),
        E(
          "p",
          date.value
            ? "Prazo: " +
                new Date(date.value + "T12:00:00").toLocaleDateString("pt-BR")
            : "Sem prazo de entrega",
        ),
        E(
          "p",
          `${existing.filter((f) => !removed.has(f.path)).length + chosen.length} materiais de apoio`,
        ),
      );
      modeHelp.textContent = team
        ? "Pesquisa em grupo. Cada aluno entrega seu registro e recebe nota e devolutiva individuais. Quem estiver sem equipe precisará ser incluído pelo professor antes de entregar."
        : "Cada aluno desenvolve e entrega sua própria investigação.";
      teamsLink.hidden = !team;
      teamsLink.href =
        url("equipes/", {
          sala: roomId,
        }) +
        (url("equipes/", {
          sala: roomId,
        }).includes("?")
          ? "&"
          : "?") +
        "periodo=" +
        encodeURIComponent(period.value);
      period.disabled = mode.disabled = published;
      const hasWork = detail.entregas.some((e) => e.missao_id === model?.id);
      weight.disabled = xp.disabled = hasWork;
      existingList.replaceChildren();
      for (const f of existing) {
        const li = E(
            "li",
            "",
            "editor-file" + (removed.has(f.path) ? " staged-removal" : ""),
          ),
          a = safeDownload(f);
        li.append(
          a || E("span", f.name),
          button(
            removed.has(f.path) ? "Desfazer" : "Remover",
            () => {
              if (removed.has(f.path)) removed.delete(f.path);
              else removed.add(f.path);
              editorDirty = true;
              sync();
            },
            "text-button",
          ),
        );
        existingList.append(li);
      }
      pendingList.replaceChildren(
        ...chosen.map((f, i) =>
          append(
            E("li"),
            E("span", f.name + " · novo"),
            button(
              "Retirar",
              () => {
                chosen.splice(i, 1);
                editorDirty = true;
                sync();
              },
              "text-button",
            ),
          ),
        ),
      );
    }
    const dirty = () => {
      editorDirty = true;
      sync();
    };
    [title, description, period, date, mode, weight, xp].forEach(
      (f) => (f.oninput = dirty),
    );
    period.onchange = mode.onchange = dirty;
    input.onchange = () => {
      try {
        chosen = validateFiles(input.files);
        errors.textContent = "";
        editorDirty = true;
        sync();
      } catch (e) {
        errors.textContent = e.message;
        chosen = [];
        input.value = "";
        sync();
      }
    };
    function values() {
      const body = {
        titulo: title.value.trim(),
        descricao: description.value.trim(),
        periodo_id: period.value,
        data_limite: date.value || null,
        tipo_atividade: mode.value,
        peso_nota: Number(weight.value),
        xp_reward: Number(xp.value),
      };
      if (!body.titulo || !body.periodo_id)
        throw new Error("Preencha o título e escolha um período.");
      if (
        !Number.isFinite(body.peso_nota) ||
        body.peso_nota < 0.1 ||
        body.peso_nota > 10 ||
        !Number.isInteger(body.xp_reward) ||
        body.xp_reward < 0 ||
        body.xp_reward > 1000
      )
        throw new Error("Confira o peso da nota e o XP.");
      return body;
    }
    async function persist() {
      const body = values();
      const total = [
        ...existing.filter((f) => !removed.has(f.path)),
        ...chosen,
      ];
      if (
        total.length > 10 ||
        total.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
      )
        throw new Error(
          "Os materiais atuais e novos ultrapassam o limite da atividade.",
        );
      if (
        new Set(total.map((f) => f.name + "-" + f.size)).size !== total.length
      )
        throw new Error("Um desses materiais já está anexado.");
      if (!model) {
        history.replaceState(
          null,
          "",
          url("atividade/nova/", {
            sala: roomId,
            preparar: creationKey,
          }),
        );
        params.set("preparar", creationKey);
        model = await D.createMission(roomId, {
          ...body,
          chave_criacao: creationKey,
        });
      } else
        model = await D.updateMission(roomId, model.id, {
          ...body,
          revisao: model.revisao,
        });
      if (!model?.id)
        throw new Error("Não foi possível confirmar o salvamento local.");
      params.set("atividade", model.id);
      history.replaceState(
        null,
        "",
        url("atividade/editar/", {
          sala: roomId,
          atividade: model.id,
        }),
      );
      for (const path of [...removed]) {
        await D.removeFile(roomId, model.id, path);
        removed.delete(path);
      }
      if (chosen.length) {
        const uploaded = await D.files(roomId, model.id);
        const missing = chosen.filter(
          (f) =>
            !uploaded.some((old) => old.name === f.name && old.size === f.size),
        );
        if (missing.length) await D.attach(roomId, model.id, missing);
        chosen = [];
        input.value = "";
      }
      const latest = await D.room(roomId);
      model = latest.missoes.find((m) => m.id === model.id);
      if (!model)
        throw new Error("A atividade não foi encontrada após salvar.");
      existing = await D.files(roomId, model.id);
      title.value = model.titulo;
      description.value = model.descricao || "";
      period.value = model.periodo_id;
      mode.value = model.tipo_atividade || "individual";
      date.value = model.data_limite?.slice(0, 10) || "";
      weight.value = model.peso_nota;
      xp.value = model.xp_reward;
      editorDirty = false;
      sync();
      notice.textContent =
        model.status_publicacao === "publicado"
          ? "Alterações salvas na atividade publicada."
          : "Rascunho salvo. Ainda não aparece para os alunos.";
    }
    async function perform(action) {
      if (busy) return;
      busy = true;
      [save, see, publish].forEach((b) => (b.disabled = true));
      $("refresh").disabled = true;
      errors.textContent = "";
      try {
        if (action === "publish" && !description.value.trim())
          throw new Error(
            "Escreva a orientação para os alunos antes de publicar.",
          );
        notice.textContent = "Salvando proposta e materiais…";
        await persist();
        if (action === "preview") {
          location.assign(previewUrl(model));
          return;
        }
        if (action === "publish") {
          const review = E("div");
          review.append(
            E("p", "Confira a proposta antes de liberar para os alunos."),
            E("h3", model.titulo),
            E("p", model.descricao, "document-copy"),
            E(
              "p",
              `${mode.value === "equipe" ? "Em equipe, com entrega individual" : "Individual"} · ${detail.periodos.find((p) => p.id === model.periodo_id)?.nome} · ${existing.length} materiais.`,
              "hint",
            ),
          );
          const a = E("a", "Ver a tela do aluno", "secondary");
          a.href = previewUrl(model);
          review.append(
            a,
            button(
              "Publicar na prévia",
              () =>
                saving(async () => {
                  const result = await D.publishMission(
                    roomId,
                    model.id,
                    model.revisao,
                  );
                  if (result.status_publicacao !== "publicado")
                    throw new Error("Publicação não confirmada.");
                  model = result;
                  $("actionDialog").close();
                  notice.textContent = "Atividade publicada na prévia local.";
                  sync();
                }),
              "primary",
            ),
          );
          dialog("Tudo pronto para compartilhar?", review);
        }
      } catch (e) {
        errors.textContent =
          (model
            ? "A atividade já existe; confira as alterações pendentes. "
            : "") + e.message;
        notice.textContent = "";
        if (model) {
          try {
            const latest = (await D.room(roomId)).missoes.find(
              (m) => m.id === model.id,
            );
            const same =
              latest &&
              [
                "titulo",
                "descricao",
                "periodo_id",
                "tipo_atividade",
                "peso_nota",
                "xp_reward",
              ].every((k) => latest[k] === model[k]) &&
              (latest.data_limite || "").slice(0, 10) ===
                (model.data_limite || "").slice(0, 10);
            if (same) {
              model = latest;
              existing = await D.files(roomId, model.id);
              chosen = chosen.filter(
                (f) =>
                  !existing.some(
                    (old) => old.name === f.name && old.size === f.size,
                  ),
              );
              removed = new Set(
                [...removed].filter((path) =>
                  existing.some((f) => f.path === path),
                ),
              );
              sync();
            }
          } catch {}
        }
      } finally {
        busy = false;
        [save, see, publish].forEach(
          (b) => (b.disabled = !detail.periodos.length),
        );
        $("refresh").disabled = false;
      }
    }
    form.onsubmit = (e) => {
      e.preventDefault();
      return perform("save");
    };
    if (!detail.periodos.length) {
      [save, see, publish].forEach((b) => (b.disabled = true));
      errors.textContent =
        "Crie um período na sala antes de preparar a atividade.";
    }
    sync();
  }
  function renderTeams() {
    heading(
      "Equipes da turma.",
      "Organize grupos por período, com os alunos cadastrados nesta sala.",
    );
    $("pageActions").append(
      button(
        "+ Criar equipe",
        () => {
          const f = E("form"),
            name = formField(f, "Nome da equipe", "text", "team-name"),
            period = formField(f, "Período", "select", "team-period");
          name.required = true;
          name.maxLength = 80;
          period.required = true;
          detail.periodos.forEach((p) => option(period, p.nome, p.id));
          if (params.get("periodo")) period.value = params.get("periodo");
          const save = E("button", "Criar equipe", "primary");
          save.type = "submit";
          save.disabled = !detail.periodos.length;
          f.append(
            E(
              "p",
              detail.periodos.length
                ? "Depois da criação, escolha os integrantes."
                : "Crie um período na sala antes de formar a equipe.",
              "hint",
            ),
            save,
          );
          f.onsubmit = (e) => {
            e.preventDefault();
            saving(async () => {
              if (!name.value.trim() || !period.value)
                throw new Error("Informe o nome e o período.");
              save.disabled = true;
              try {
                const t = await D.createTeam(roomId, {
                  nome: name.value.trim(),
                  periodo_id: period.value,
                });
                $("actionDialog").close();
                await load();
                await manageTeam(t.id);
              } finally {
                save.disabled = false;
              }
            });
          };
          dialog("Uma nova equipe", f);
        },
        "primary",
      ),
    );
    const grid = E("div", "", "team-grid");
    detail.equipes.forEach((t) => {
      const p = panel(
        t.nome,
        detail.periodos.find((p) => p.id === t.periodo_id)?.nome ||
          "Período da turma",
      );
      p.classList.add("team-card");
      p.append(button("Ver integrantes e organizar →", () => manageTeam(t.id)));
      grid.append(p);
    });
    $("content").append(grid);
    if (!detail.equipes.length)
      $("content").append(
        E("p", "Nenhuma equipe criada neste período.", "empty"),
      );
  }
  async function manageTeam(id) {
    try {
      const data = await D.team(roomId, id),
        body = E("div");
      body.append(
        E(
          "p",
          `${data.membros.length} integrante${data.membros.length === 1 ? "" : "s"}. Até 4 integrantes. O aluno pode pertencer a uma equipe por período.`,
        ),
      );
      data.membros.forEach((a) => {
        const row = E("div", "", "member");
        row.append(
          E("span", a.nome),
          button(
            "Remover",
            () => {
              const confirm = E("div");
              confirm.append(
                E(
                  "p",
                  `Remover ${a.nome} desta equipe? O aluno continuará cadastrado na turma.`,
                ),
                button(
                  "Confirmar remoção",
                  () =>
                    saving(async () => {
                      await D.removeMember(roomId, id, a.id);
                      await manageTeam(id);
                    }),
                  "primary",
                ),
              );
              dialog("Revisar remoção", confirm);
            },
            "text-button",
          ),
        );
        body.append(row);
      });
      const form = E("form"),
        select = formField(
          form,
          "Adicionar aluno da turma",
          "select",
          "team-student",
        );
      data.alunos_disponiveis.forEach((a) => option(select, a.nome, a.id));
      const add = E("button", "Adicionar integrante", "primary");
      add.type = "submit";
      add.disabled =
        !data.alunos_disponiveis.length || data.membros.length >= 4;
      form.append(add);
      form.onsubmit = (e) => {
        e.preventDefault();
        saving(async () => {
          if (!select.value) throw new Error("Selecione um aluno disponível.");
          await D.addMember(roomId, id, select.value);
          await manageTeam(id);
        });
      };
      body.append(form);
      if (!data.alunos_disponiveis.length)
        body.append(
          E("p", "Todos os alunos já estão em equipes deste período.", "hint"),
        );
      dialog(data.equipe.nome, body);
    } catch (e) {
      err(e);
    }
  }
  function renderCorrections() {
    heading(
      "Correções da sala.",
      "Um retorno claro ajuda o aluno a avançar na próxima descoberta.",
    );
    const p = panel("Entregas dos alunos"),
      filters = E("div", "", "filters"),
      search = E("input"),
      state = E("select");
    search.type = "search";
    search.placeholder = "Buscar aluno ou atividade…";
    search.setAttribute("aria-label", "Buscar entrega");
    state.setAttribute("aria-label", "Situação da entrega");
    option(state, "A corrigir", "entregue");
    option(state, "Todas as entregas", "");
    option(state, "Corrigidas", "corrigido");
    const rows = E("div");
    filters.append(search, state);
    p.append(filters, rows);
    $("content").append(p);
    const render = () => {
      const q = search.value.toLowerCase(),
        mission = params.get("atividade"),
        list = detail.entregas.filter(
          (e) =>
            (!state.value || e.status === state.value) &&
            (!mission || e.missao_id === mission) &&
            `${e.perfis?.nome || ""} ${e.titulo_missao || ""}`
              .toLowerCase()
              .includes(q),
        );
      rows.replaceChildren(
        table(
          ["Aluno", "Atividade", "Situação", "Nota", ""],
          list.map((e) => [
            e.perfis?.nome ||
              detail.alunos.find((a) => a.id === e.aluno_id)?.nome ||
              "Aluno",
            e.titulo_missao ||
              detail.missoes.find((m) => m.id === e.missao_id)?.titulo ||
              "Atividade",
            e.status === "corrigido" ? "Corrigida" : "A corrigir",
            fmt(grade(e.nota)),
            link(
              "Abrir entrega",
              "correcao/",
              {
                sala: roomId,
                entrega: e.id,
              },
              "text-button",
            ),
          ]),
        ),
      );
      if (!list.length)
        rows.append(
          E("p", "Nenhuma entrega corresponde a estes filtros.", "empty"),
        );
    };
    search.oninput = render;
    state.onchange = render;
    render();
  }
  let reviewDirty = false;
  function deliveryDate(value) {
    if (!value) return "Data não informada";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Data não informada"
      : date.toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });
  }
  async function renderReview(token) {
    const record = detail.entregas.find((e) => e.id === params.get("entrega"));
    if (!record) throw new Error("Entrega não encontrada nesta turma.");
    const delivery = await D.delivery(record.id);
    if (token !== renderToken) return;
    const mission = detail.missoes.find((m) => m.id === record.missao_id),
      student =
        delivery.perfis || detail.alunos.find((a) => a.id === record.aluno_id);
    heading(
      "Um retorno que faz avançar.",
      `${student?.nome || "Aluno"} · ${mission?.titulo || record.titulo_missao || "Atividade"}`,
    );
    $("pageActions").append(
      link(
        "← Todas as entregas",
        "correcoes/",
        {
          sala: roomId,
        },
        "secondary",
      ),
      link(
        "Histórico do aluno",
        "aluno/",
        {
          sala: roomId,
          aluno: record.aluno_id || student?.id,
        },
        "text-button",
      ),
    );
    const grid = E("div", "", "review-grid"),
      work = E("div", "", "stack"),
      answer = panel("Trabalho do aluno"),
      meta = E("div", "", "review-meta");
    meta.append(
      E(
        "span",
        delivery.status === "corrigido"
          ? "Correção registrada"
          : "Aguardando correção",
        delivery.status === "corrigido" ? "badge green" : "badge gold",
      ),
      E(
        "span",
        "Entregue em " + deliveryDate(delivery.entregue_em),
        "small-label",
      ),
    );
    answer.append(
      meta,
      E(
        "p",
        delivery.resposta_entrega || "O aluno enviou apenas arquivos.",
        "document-copy",
      ),
    );
    const orientation = E("details", "", "orientation");
    orientation.append(
      E("summary", "Relembrar a orientação da atividade"),
      E(
        "p",
        mission?.descricao || "Sem orientação cadastrada.",
        "document-copy",
      ),
    );
    answer.append(orientation);
    work.append(answer);
    const materials = panel(
        "Anexos da entrega",
        "PDFs e imagens podem ser visualizados aqui. Outros documentos ficam disponíveis para baixar.",
      ),
      fileList = E("div", "", "review-file-list"),
      preview = E("div", "", "file-preview");
    materials.append(fileList, preview);
    work.append(materials);
    const fileItems = delivery.anexos || [];
    let firstPreview = null;
    for (const f of fileItems) {
      const download = safeDownload(f);
      if (!download) continue;
      download.className = "text-button";
      download.textContent = "Baixar";
      const row = E("div", "", "review-file"),
        copy = E("div");
      copy.append(
        E("strong", f.name),
        E("small", Math.ceil((f.size || 0) / 1024) + " KB"),
      );
      row.append(copy, download);
      if (
        ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(
          f.type,
        )
      ) {
        let src = null;
        if (f.blob instanceof Blob) {
          src = URL.createObjectURL(f.blob);
          objectURLs.push(src);
        } else {
          try {
            const u = new URL(f.preview_url || f.url);
            if (u.protocol === "https:") src = u.href;
          } catch {}
        }
        if (src) {
          const show = () => {
            preview.replaceChildren();
            fileList
              .querySelectorAll("button")
              .forEach((b) => b.setAttribute("aria-pressed", "false"));
            view.setAttribute("aria-pressed", "true");
            preview.append(E("p", f.name, "small-label"));
            if (f.type === "application/pdf") {
              const frame = E("iframe");
              frame.title = "Visualização de " + f.name;
              frame.src = src;
              preview.append(
                frame,
                E(
                  "p",
                  "Se o PDF não abrir, use Baixar. Para renovar o acesso aos anexos, atualize a página.",
                  "hint",
                ),
              );
            } else {
              const image = E("img");
              image.alt = "Anexo do aluno: " + f.name;
              image.src = src;
              preview.append(image);
            }
          };
          const view = button("Visualizar", show, "secondary");
          view.setAttribute("aria-pressed", "false");
          row.append(view);
          firstPreview ??= show;
        }
      }
      fileList.append(row);
    }
    if (!fileItems.length)
      materials.append(E("p", "Nenhum arquivo anexado.", "empty"));
    if (firstPreview) firstPreview();
    const evaluation = panel(
      "Sua devolutiva",
      "Avalie o processo e indique um próximo passo.",
    );
    evaluation.classList.add("review-evaluation");
    const form = E("form");
    form.id = "reviewForm";
    const note = formField(
        form,
        "Nota · de 0 a 10",
        "number",
        "delivery-grade",
        delivery.nota ?? "",
      ),
      feedback = formField(
        form,
        "Orientação ao aluno",
        "textarea",
        "delivery-feedback",
        delivery.comentario_professor || "",
      );
    note.required = true;
    note.min = "0";
    note.max = "10";
    note.step = ".1";
    feedback.maxLength = 3000;
    feedback.rows = 8;
    feedback.placeholder =
      "O que foi bem feito? O que pode melhorar? Qual é o próximo passo?";
    const count = E("p", `${feedback.value.length} / 3.000 caracteres`, "hint"),
      draft = E("p", "", "hint");
    form.append(count, draft);
    const draftKey = `astrolearn-review-${"demo"}-${record.id}`;
    if (delivery.status !== "corrigido") {
      try {
        const saved = JSON.parse(sessionStorage.getItem(draftKey));
        if (saved) {
          note.value = saved.nota ?? "";
          feedback.value = saved.feedback || "";
          count.textContent = feedback.value.length + " / 3.000 caracteres";
          draft.textContent = "Rascunho recuperado nesta aba.";
          reviewDirty = true;
        }
      } catch {}
    }
    const save = E("button", "Salvar correção da prévia", "primary"),
      error = E("p", "", "error-panel");
    save.type = "submit";
    error.setAttribute("role", "alert");
    form.append(
      E(
        "p",
        "Somente demonstração. Nenhum aluno real receberá esta correção.",
        "hint",
      ),
      save,
      error,
    );
    const remember = () => {
      reviewDirty = true;
      count.textContent = feedback.value.length + " / 3.000 caracteres";
      try {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({
            nota: note.value,
            feedback: feedback.value,
          }),
        );
        draft.textContent = "Rascunho salvo nesta aba.";
      } catch {
        draft.textContent = "Alterações mantidas somente nesta visita.";
      }
    };
    note.oninput = feedback.oninput = remember;
    const tips = E("details", "", "orientation");
    tips.append(
      E("summary", "Como escrever uma boa devolutiva"),
      E(
        "p",
        "Reconheça uma escolha acertada, explique uma melhoria concreta e proponha um próximo passo. Exemplo: “Você manteve a água igual nas duas plantas. Agora registre a altura diariamente para comparar os resultados.”",
        "hint",
      ),
    );
    evaluation.append(form, tips);
    const complete = () => {
      note.disabled = feedback.disabled = save.disabled = true;
      save.textContent = "Correção registrada";
      reviewDirty = false;
      draft.textContent = "Nota e devolutiva registradas.";
      try {
        sessionStorage.removeItem(draftKey);
      } catch {}
      const next = detail.entregas.find(
        (e) => e.status === "entregue" && e.id !== record.id,
      );
      const actions = E("div", "", "button-row");
      if (next)
        actions.append(
          link(
            "Próxima entrega →",
            "correcao/",
            {
              sala: roomId,
              entrega: next.id,
            },
            "primary",
          ),
        );
      actions.append(
        link("Voltar à fila", "correcoes/", {
          sala: roomId,
        }),
      );
      evaluation.append(actions);
    };
    if (delivery.status === "corrigido") complete();
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (save.disabled) return;
      const n = grade(note.value);
      if (n === null || n < 0 || n > 10) {
        error.textContent = "Informe uma nota entre 0 e 10.";
        note.focus();
        return;
      }
      save.disabled = true;
      $("refresh").disabled = true;
      error.textContent = "";
      try {
        await D.correct(record.id, n, feedback.value.trim());
        complete();
        $("status").textContent = "Correção salva na prévia local.";
        window.dispatchEvent(new window.Event("astro-notifications-refresh"));
      } catch (e) {
        let confirmed = false;
        try {
          const current = await D.delivery(record.id);
          confirmed =
            current.status === "corrigido" &&
            grade(current.nota) === n &&
            (current.comentario_professor || "") === feedback.value.trim();
        } catch {}
        if (confirmed) {
          complete();
          $("status").textContent =
            "Consulta concluída: esta correção já está registrada.";
        } else {
          error.textContent = e.message;
          save.disabled = false;
        }
      } finally {
        $("refresh").disabled = false;
      }
    };
    grid.append(work, evaluation);
    $("content").append(grid);
  }
  async function renderQuestions(token) {
    const questions = await D.questions(roomId);
    if (token !== renderToken) return;
    heading(
      "Perguntar também é aprender.",
      "Conversas privadas dos alunos com o professor, organizadas por atividade.",
    );
    const pending = questions.filter((q) => !q.resposta).length;
    $("content").append(
      append(
        E("section", "", "stats"),
        stat("Aguardando resposta", pending),
        stat("Respondidas", questions.length - pending),
        stat("Perguntas nesta turma", questions.length),
      ),
    );
    $("pageActions").append(
      link("← Voltar à sala", "sala/", {
        sala: roomId,
      }),
    );
    const a = E("a", "Testar pergunta como aluno ↗", "secondary");
    a.href = "../aluno/atividade.html?missao=1";
    $("pageActions").append(a);
    const controls = E("div", "", "filters"),
      search = E("input"),
      filter = E("select");
    search.type = "search";
    search.placeholder = "Buscar aluno, atividade ou pergunta…";
    search.setAttribute("aria-label", "Buscar pergunta");
    filter.setAttribute("aria-label", "Situação da pergunta");
    option(filter, "Sem resposta", "pending");
    option(filter, "Todas", "all");
    option(filter, "Respondidas", "answered");
    if (params.get("pergunta")) filter.value = "all";
    controls.append(search, filter);
    $("content").append(controls);
    const list = E("div", "", "question-list"),
      empty = E("p", "Nenhuma pergunta corresponde aos filtros.", "empty");
    $("content").append(list, empty);
    const cards = [];
    for (const q of questions) {
      const p = panel(
        q.perfis?.nome ||
          detail.alunos.find((a) => a.id === q.aluno_id)?.nome ||
          "Aluno",
        (q.missoes?.titulo ||
          detail.missoes.find((m) => m.id === q.missao_id)?.titulo ||
          "Atividade") +
          " · " +
          deliveryDate(q.criado_em),
      );
      p.id = "pergunta-" + q.id;
      p.classList.add("question-card");
      if (params.get("pergunta") === q.id)
        p.classList.add("question-highlight");
      p.append(E("p", q.texto, "document-copy"));
      const reply = E("div", "", "teacher-reply");
      p.append(reply);
      const renderReply = () => {
        reply.replaceChildren(
          E("strong", "Sua resposta"),
          E("p", q.resposta, "document-copy"),
          E("small", deliveryDate(q.respondida_em)),
        );
      };
      if (q.resposta) renderReply();
      else {
        reply.hidden = true;
        const form = E("form"),
          input = formField(
            form,
            "Responder ao aluno",
            "textarea",
            "reply-" + q.id,
          );
        input.required = true;
        input.maxLength = 3000;
        input.rows = 3;
        const save = E("button", "Responder na prévia", "primary"),
          error = E("p", "", "error-panel");
        save.type = "submit";
        error.setAttribute("role", "alert");
        form.append(
          E(
            "p",
            "A resposta fica visível somente para este aluno e o professor.",
            "hint",
          ),
          save,
          error,
        );
        p.append(form);
        form.onsubmit = async (e) => {
          e.preventDefault();
          if (save.disabled) return;
          if (!input.value.trim()) {
            error.textContent = "Escreva uma orientação para o aluno.";
            return;
          }
          save.disabled = true;
          error.textContent = "";
          try {
            const r = await D.answer(q.id, input.value.trim());
            if (!r.pergunta?.id)
              throw new Error("A resposta não foi confirmada.");
            Object.assign(q, r.pergunta);
            form.hidden = true;
            reply.hidden = false;
            renderReply();
            $("status").textContent = "Resposta salva na prévia.";
            applyFilters();
            const totals = $("content").querySelectorAll(".stats strong");
            totals[0].textContent = questions.filter((q) => !q.resposta).length;
            totals[1].textContent = questions.filter((q) => q.resposta).length;
          } catch (e) {
            error.textContent = e.message;
            save.disabled = false;
          }
        };
      }
      list.append(p);
      cards.push({
        p,
        q,
      });
    }
    function applyFilters() {
      let visible = 0;
      const query = search.value.trim().toLowerCase();
      cards.forEach(({ p, q }) => {
        const status =
          filter.value === "all" ||
          (filter.value === "pending" && !q.resposta) ||
          (filter.value === "answered" && q.resposta);
        p.hidden =
          !status ||
          !`${q.perfis?.nome || ""} ${q.missoes?.titulo || ""} ${q.texto}`
            .toLowerCase()
            .includes(query);
        if (!p.hidden) visible++;
      });
      empty.hidden = visible > 0;
    }
    search.oninput = filter.onchange = applyFilters;
    applyFilters();
    if (params.get("pergunta"))
      document
        .getElementById("pergunta-" + params.get("pergunta"))
        ?.scrollIntoView?.({
          block: "center",
          behavior: "instant",
        });
  }
  async function renderNotices(token) {
    heading(
      "Sua caixa de avisos.",
      "Entregas e perguntas das suas turmas, organizadas em um só lugar.",
    );
    const result = await D.notifications(false);
    if (token !== renderToken) return;
    const controls = E("div", "", "filters"),
      filter = E("select"),
      type = E("select");
    filter.setAttribute("aria-label", "Situação da notificação");
    type.setAttribute("aria-label", "Tipo da notificação");
    option(filter, "Não lidas", "unread");
    option(filter, "Todas", "all");
    option(type, "Todos os tipos", "");
    option(type, "Entregas", "entrega");
    option(type, "Perguntas", "pergunta");
    controls.append(filter, type);
    const mark = button(
      "Marcar exibidas como lidas",
      async () => {
        mark.disabled = true;
        try {
          const ids = result.notificacoes.filter(matches).map((n) => n.id);
          await D.readNotifications(ids);
          window.dispatchEvent(new Event("astro-notifications-refresh"));
          await load();
          $("status").textContent = "Avisos marcados como lidos nesta prévia.";
        } catch (e) {
          err(e);
          mark.disabled = false;
        }
      },
      "secondary",
    );
    controls.append(mark);
    $("pageActions").append(
      button(
        "Simular nova entrega",
        async () => {
          try {
            await D.simulateDelivery();
            await load();
            window.dispatchEvent(new Event("astro-notifications-refresh"));
          } catch (e) {
            err(e);
          }
        },
        "secondary",
      ),
    );
    $("content").append(controls);
    const list = E("div", "", "notification-page");
    $("content").append(list);
    function matches(n) {
      return (
        (filter.value === "all" || !n.lida_em) &&
        (!type.value || n.tipo === type.value)
      );
    }
    function render() {
      list.replaceChildren();
      const rows = result.notificacoes.filter(matches);
      mark.disabled = !rows.some((n) => !n.lida_em);
      for (const n of rows) {
        const p = panel(n.titulo, n.mensagem);
        p.classList.add("notification-card");
        p.append(
          E(
            "span",
            n.lida_em ? "Lida" : "Não lida",
            n.lida_em ? "badge" : "badge gold",
          ),
          E("p", deliveryDate(n.criado_em), "hint"),
        );
        const values = {
          sala: n.sala_id,
        };
        if (n.tipo === "entrega") values.entrega = n.entrega_id;
        else values.pergunta = n.pergunta_id;
        const a = link(
          n.tipo === "entrega" ? "Abrir entrega →" : "Ver pergunta →",
          n.tipo === "entrega" ? "correcao/" : "perguntas/",
          values,
        );
        a.onclick = async (e) => {
          e.preventDefault();
          try {
            await D.readNotifications([n.id]);
            location.assign(a.href);
          } catch (e) {
            err(e);
          }
        };
        p.append(a);
        list.append(p);
      }
      if (!rows.length)
        list.append(
          E(
            "p",
            "Tudo em dia. Nenhum aviso corresponde a este filtro.",
            "empty",
          ),
        );
    }
    filter.onchange = type.onchange = render;
    render();
  }
  window.addEventListener("beforeunload", (e) => {
    if (reviewDirty || editorDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  async function load() {
    const token = ++renderToken;
    clearURLs();
    $("content").replaceChildren();
    $("content").setAttribute("aria-busy", "true");
    $("error").textContent = "";
    $("pageActions").replaceChildren();
    $("refresh").disabled = true;
    $("mode").textContent = "PRÉVIA DO PROFESSOR";
    $("modeNote").textContent =
      "Dados de exemplo. Criações, equipes e correções ficam somente neste navegador.";
    nav();
    try {
      rooms = await D.rooms();
      if (token !== renderToken) return;
      if (page === "rooms") {
        detail = null;
        breadcrumbs();
        await renderRooms(token);
      } else if (page === "notifications") {
        detail = null;
        breadcrumbs();
        await renderNotices(token);
      } else {
        if (!roomId) {
          heading(
            "Escolha uma turma.",
            "Abra a sala antes de consultar esta área.",
          );
          detail = null;
          breadcrumbs();
          await renderRooms(token);
          return;
        }
        detail = await D.room(roomId);
        if (token !== renderToken) return;
        breadcrumbs();
        periodFilter();
        await {
          room: renderRoom,
          student: renderStudent,
          activities: renderActivities,
          activity: () => renderActivity(token),
          create: () => renderCreate(),
          teams: renderTeams,
          corrections: renderCorrections,
          review: () => renderReview(token),
          questions: () => renderQuestions(token),
        }[page]?.();
      }
    } catch (e) {
      if (token === renderToken) {
        err(e);
        $("content").replaceChildren(
          append(
            E("section", "", "panel"),
            E(
              "p",
              "Não foi possível carregar esta página. Seus dados não foram substituídos por exemplos.",
            ),
            link("Voltar às turmas", "", {}, "primary"),
          ),
        );
      }
    } finally {
      if (token === renderToken) {
        $("refresh").disabled = false;
        $("content").setAttribute("aria-busy", "false");
      }
    }
  }
  $("refresh").onclick = () => {
    if (
      (reviewDirty || editorDirty) &&
      !window.confirm(
        "Atualizar a página? Salve os rascunhos e arquivos antes de atualizar.",
      )
    )
      return;
    load();
  };
  window.addEventListener("pagehide", clearURLs);
  load();
})();
