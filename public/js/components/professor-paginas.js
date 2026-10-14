(() => {
  "use strict";

  const e = window.TeacherData;
  const a = id => document.getElementById(id);
  const t = new URLSearchParams(location.search);
  const o = document.body.dataset.page;
  const i = t.get("sala");

  let n = null;
  let r = [];
  let s = null;
  let d = false;
  let l = 0;

  const p = [];

  const c = (tag, texto = "", classe = "") => {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;
    elemento.className = classe;
    return elemento;
  };

  const u = (elemento, ...filhos) => {
    elemento.append(...filhos);
    return elemento;
  };

  const m = (rota, valores = {}) => {
    const query = new URLSearchParams(valores);

    if (valores.sala && t.get("periodo")) {
      query.set("periodo", t.get("periodo"));
    }

    const rotas = {
      "": "home.html",
      "sala/": "turma.html",
      "aluno/": "aluno.html",
      "atividade/": "atividade.html",
      "atividade/nova/": "editor-atividade.html",
      "atividade/editar/": "editor-atividade.html",
      "atividades/": "atividades.html",
      "biblioteca/": "biblioteca.html",
      "equipes/": "equipes.html",
      "correcoes/": "correcoes.html",
      "correcao/": "correcao.html",
      "perguntas/": "perguntas.html",
      "notificacoes/": "notificacoes.html"
    };

    return (rotas[rota] || "home.html") +
      (query.size ? "?" + query.toString() : "");
  };

  const v = (
    texto,
    rota,
    valores = {},
    classe = "secondary"
  ) => {
    const link = c("a", texto, classe);
    link.href = m(rota, valores);
    return link;
  };

  const g = (texto, acao, classe = "secondary") => {
    const botao = c("button", texto, classe);
    botao.type = "button";
    botao.onclick = acao;
    return botao;
  };

  const h = erro => {
    a("error").textContent = erro.message || String(erro);
  };

  const f = valor => {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return null;
    }

    return Number.isFinite(Number(valor))
      ? Number(valor)
      : null;
  };

  const b = valor => valor === null
    ? "—"
    : Number(valor).toLocaleString(
        "pt-BR",
        { maximumFractionDigits: 1 }
      );

  const w = (titulo, subtitulo) => {
    a("pageTitle").textContent = titulo;
    a("pageSubtitle").textContent = subtitulo;
    document.title = titulo + " · AstroLearn";
  };

  const y = (titulo, subtitulo = "") => {
    const painel = c("section", "", "panel");

    painel.append(c("h2", titulo));

    if (subtitulo) {
      painel.append(c("p", subtitulo));
    }

    return painel;
  };

  const x = (titulo, valor) => u(
    c("div", "", "card stat"),
    c("span", titulo),
    c("strong", valor)
  );

function A() { p.splice(0).forEach(e => URL.revokeObjectURL(e)) }
function C(e, t) { s = document.activeElement, a("dialogTitle").textContent = e, a("dialogContent").replaceChildren(t), a("dialogError").textContent = "", a("actionDialog").showModal() }
async function E(e) { if (!d) { d = !0, a("closeDialog").disabled = !0; try { await e() } catch (e) { a("dialogError").textContent = e.message } finally { d = !1, a("closeDialog").disabled = !1 } } }
function _(a, t, o = "text", i = "", n = "") { const r = `field-${i || e.uid()}`, s = c("label", t); s.htmlFor = r; const d = c("textarea" === o ? "textarea" : "select" === o ? "select" : "input"); return d.id = r, d.name = i, "textarea" !== o && "select" !== o && (d.type = o), d.value = n, "textarea" === o && (d.rows = 5), a.append(s, d), d }
function q(e, a, t) { const o = c("option", a); o.value = t, e.append(o) }
function S(e, a) { const t = c("div", "", "table-wrap"), o = c("table"), i = c("thead"), n = c("tr"); e.forEach(e => { const a = c("th", e); a.scope = "col", n.append(a) }), i.append(n), o.append(i); const r = c("tbody"); return a.forEach(e => { const a = c("tr"); e.forEach(e => { const t = c("td"); t.append(e instanceof Node ? e : document.createTextNode(String(e))), a.append(t) }), r.append(a) }), o.append(r), t.append(o), t }
function N(e, a, t) { const o = y(e, t); return a.forEach((e, a) => { const t = c("div", "", "bar-row"), i = c("div", "", "bar-track"), n = c("div", "", "bar-fill"); n.style.width = Math.max(0, Math.min(100, e.percent || 0)) + "%", n.setAttribute("aria-hidden", "true"), i.append(n), t.append(c("span", e.label), i, c("strong", String(e.value))), o.append(t) }), o }
function M(e, a, t = "Escala de 0 a 10. Atividades sem nota permanecem sem ponto.") {
  const o = y(e, t); o.classList.add("chart");
  const i = "http://www.w3.org/2000/svg", n = document.createElementNS(i, "svg");
  n.setAttribute("viewBox", "0 0 620 210"), n.setAttribute("role", "img"), n.setAttribute("aria-label", e + ". " + a.map((e, a) => `Atividade ${a + 1}: ${null == e.value ? "sem nota" : b(e.value)}`).join("; ")), n.classList.add("chart-svg");
  const r = (e, a) => { const t = document.createElementNS(i, e); return Object.entries(a).forEach(([e, a]) => t.setAttribute(e, a)), t };
  [0, 5, 10].forEach(e => { const a = 175 - 15 * e; n.append(r("line", { x1: 38, x2: 595, y1: a, y2: a, class: "grid" })); const t = r("text", { x: 15, y: a + 4 }); t.textContent = e, n.append(t) });
  let s = null;
  a.forEach((e, t) => { const o = a.length < 2 ? 315 : 48 + 535 * t / (a.length - 1), i = f(e.value); if (null != i) { const a = 175 - 15 * Math.max(0, Math.min(10, i)); s && n.append(r("line", { x1: s.x, y1: s.y, x2: o, y2: a, class: "trend" })); const t = r("circle", { cx: o, cy: a, r: 5 }), d = r("title", {}); d.textContent = `${e.label}: ${b(i)}`, t.append(d), n.append(t), s = { x: o, y: a } } else s = null; const d = r("text", { x: o, y: 199, "text-anchor": "middle" }); d.textContent = t + 1, n.append(d) });
  o.append(n);
  const d = c("details");
  return d.append(c("summary", "Ver atividades e valores"), S(["Atividade", "Nota"], a.map(e => [e.label, b(f(e.value))]))), o.append(d), a.some(e => null != f(e.value)) || o.append(c("p", "Ainda não há notas registradas para este gráfico.", "chart-caption")), o
}
function R(e) {
  const a = new Set(e.missoes.filter(e => "rascunho" !== e.status_publicacao).map(e => e.id)), t = new Set(e.alunos.map(e => e.id)), o = new Map;
  for (const i of e.entregas) a.has(i.missao_id) && t.has(i.aluno_id || i.perfis?.id) && !o.has(`${i.aluno_id || i.perfis?.id}-${i.missao_id}`) && o.set(`${i.aluno_id || i.perfis?.id}-${i.missao_id}`, i);
  const i = [...o.values()], n = a.size * t.size, r = i.filter(e => "corrigido" === e.status).length, s = i.filter(e => "entregue" === e.status).length;
  return { total: n, corrected: r, pending: s, missing: Math.max(0, n - r - s) }
}
a("closeDialog").onclick = function () { d || a("actionDialog").close() };
a("actionDialog").addEventListener("cancel", e => { d && e.preventDefault() });
a("actionDialog").addEventListener("close", () => { s?.focus() });
const P = e => e.missoes.filter(e => "rascunho" !== e.status_publicacao);
function $(e) { return P(e).map(a => { const t = (e.pauta.pauta_data || []).map(e => f(e.notas?.[a.id])).filter(e => null !== e); return { label: (e.periodos.find(e => e.id === a.periodo_id)?.nome || "Período") + " · " + a.titulo, value: t.length ? t.reduce((e, a) => e + a, 0) / t.length : null } }) }

async function L(t) {
  w("Suas turmas.", "Cada sala, uma nova expedição. Escolha uma turma para acompanhar os alunos.");
  a("pageActions").append(g("+ Criar turma", () => z("Criar turma", "Nome da turma", async a => { const t = await e.createRoom(a); location.assign(m("sala/", { sala: t.id })) }), "primary"));
  const o = await Promise.all(r.map(async a => ({ room: a, data: await e.room(a.id) })));
  if (t !== l) return;
  const i = c("div", "", "room-grid");
  o.forEach(({ room: e, data: a }) => {
    const t = c("article", "", "card room-card"), o = c("div", "", "room-art");
    o.setAttribute("aria-hidden", "true"), o.append(c("span", "EXPEDIÇÃO STEAM"), c("span", "", "room-planet"));
    const n = c("div", "", "room-body"), r = R(a);
    n.append(c("h2", e.nome), c("p", `${a.alunos.length} alunos · ${P(a).length} publicadas · ${a.missoes.length - P(a).length} rascunhos`));
    const s = c("div", "", "room-data");
    s.append(u(c("div"), c("strong", r.pending), c("span", "a corrigir")), u(c("div"), c("strong", r.corrected), c("span", "corrigidas"))), n.append(s);
    const d = c("div", "", "mini-chart"), l = $(a);
    l.forEach(e => { const a = c("div"); a.style.height = (null == e.value ? 0 : Math.max(2, 4 * e.value)) + "px", null == e.value && (a.style.background = "transparent", a.style.minHeight = "0"), a.title = `${e.label}: ${b(e.value)}`, a.append(c("span", b(e.value))), d.append(a) });
    d.setAttribute("role", "img"), d.setAttribute("aria-label", "Médias das atividades: " + l.map(e => `${e.label}: ${b(e.value)}`).join("; "));
    n.append(d, c("p", "Médias por atividade · escala 0–10", "mini-label"), v("Entrar na turma →", "sala/", { sala: e.id }, "primary"));
    t.append(o, n), i.append(t)
  });
  a("content").append(i), r.length || a("content").append(c("p", "Você ainda não tem turmas. Crie sua primeira sala.", "empty"))
}
function z(e, a, t) {
  const o = c("form"), i = _(o, a); i.required = !0, i.maxLength = 80;
  const n = c("button", "Confirmar", "primary"); n.type = "submit";
  o.append(c("p", "A criação fica apenas na prévia deste navegador.", "hint"), n);
  o.onsubmit = e => { e.preventDefault(), i.value.trim() && E(async () => { n.disabled = !0; try { await t(i.value.trim()) } finally { n.disabled = !1 } }) };
  C(e, o)
}
function D() {
  const e = a("breadcrumbs");
  e.replaceChildren(v("Turmas", "", {}, ""));
  n && (e.append(c("span", "/"), v(n.sala.nome, "sala/", { sala: i }, "")), "room" !== o && e.append(c("span", "/"), c("span", { student: "Aluno", activities: "Atividades", activity: "Atividade", create: "Nova atividade", teams: "Equipes", corrections: "Correções", review: "Corrigir entrega", questions: "Perguntas" }[o])))
}
function T() {
  w(n.sala.nome, "Uma visão da turma para orientar a próxima descoberta.");
  a("pageActions").append(v("+ Criar atividade", "atividade/nova/", { sala: i }, "primary"), v("Organizar equipes", "equipes/", { sala: i }), v("Revisar entregas", "correcoes/", { sala: i }));
  const t = R(n);
  a("content").append(u(c("section", "", "stats"), x("Alunos cadastrados", n.alunos.length), x("Atividades publicadas", P(n).length), x("Aguardando correção", t.pending)));
  const o = c("div", "", "two-columns"), r = y("Alunos cadastrados", "Abra o aluno para consultar notas, entregas e seu desenvolvimento."), s = c("input");
  s.type = "search", s.placeholder = "Buscar aluno…", s.setAttribute("aria-label", "Buscar aluno da turma");
  const d = c("div"); r.id = "alunos", r.append(s, d);
  const l = () => {
    const e = s.value.toLocaleLowerCase("pt-BR"), a = n.alunos.filter(a => a.nome.toLocaleLowerCase("pt-BR").includes(e));
    d.replaceChildren(S(["Aluno", "Média de atividades", "Entregas", ""], a.map(e => {
      const a = n.pauta.pauta_data.find(a => a.aluno.id === e.id), t = n.entregas.filter(a => (a.aluno_id || a.perfis?.id) === e.id);
      return [u(c("div", "", "cell-name"), c("span", e.nome.slice(0, 1), "initial"), c("span", e.nome)), b(f(a?.media_missoes ?? a?.media)), `${t.length}/${P(n).length}`, v("Ver aluno →", "aluno/", { sala: i, aluno: e.id }, "")]
    }))), a.length || d.append(c("p", "Nenhum aluno encontrado.", "empty"))
  };
  s.oninput = l, l();
  const p = c("div", "", "stack");
  p.append(M("Notas da turma por atividade", $(n), "Média apenas das notas registradas em cada atividade. Escala de 0 a 10."), function (e) {
    const a = R(e), t = a.total || 1;
    return N("Situação das atividades", [{ label: "Corrigidas", value: a.corrected, percent: a.corrected / t * 100 }, { label: "A corrigir", value: a.pending, percent: a.pending / t * 100 }, { label: "Sem entrega", value: a.missing, percent: a.missing / t * 100 }], "Contagem por aluno e atividade cadastrada. Inclui atividades futuras; não representa atraso.")
  }(n));
  o.append(r, p), a("content").append(o);
  const m = c("div", "", "room-code");
  m.append(c("span", "Código da turma"), c("strong", n.sala.codigo_acesso || "—"), g("Copiar código", async () => { try { await navigator.clipboard.writeText(n.sala.codigo_acesso), a("status").textContent = "Código copiado." } catch { a("status").textContent = "Selecione o código para copiá-lo." } }, "text-button"), g("+ Criar período", () => z("Criar período", "Nome do período", async t => { await e.createPeriod(i, t), a("actionDialog").close(), await G() }), "text-button"));
  a("content").append(m)
}
function O() {
  const e = t.get("aluno"), o = n.alunos.find(a => a.id === e);
  if (!o) throw new Error("Este aluno não pertence à turma selecionada.");
  w(o.nome, "Acompanhamento individual: atividades, notas e retorno do professor.");
  const r = n.pauta.pauta_data.find(a => a.aluno.id === e), s = n.entregas.filter(a => (a.aluno_id || a.perfis?.id) === e), d = s.filter(e => "corrigido" === e.status);
  a("content").append(u(c("section", "", "stats"), x("Média das atividades", b(f(r?.media_missoes ?? r?.media))), x("Entregas registradas", `${s.length}/${P(n).length}`), x("Atividades corrigidas", d.length)));
  const l = P(n).map(e => ({ label: (n.periodos.find(a => a.id === e.periodo_id)?.nome || "Período") + " · " + e.titulo, value: f(r?.notas?.[e.id]) })), p = c("div", "", "two-columns");
  p.append(M("Notas por atividade", l), N("Situação individual", [{ label: "Corrigidas", value: d.length, percent: d.length / (P(n).length || 1) * 100 }, { label: "A corrigir", value: s.filter(e => "entregue" === e.status).length, percent: s.filter(e => "entregue" === e.status).length / (P(n).length || 1) * 100 }, { label: "Sem entrega", value: Math.max(0, P(n).length - s.length), percent: Math.max(0, P(n).length - s.length) / (P(n).length || 1) * 100 }], "Atividades sem avaliação não entram na média."));
  a("content").append(p);
  const m = y("Histórico de atividades", "A nota e a orientação pertencem a cada atividade, não a um rótulo do aluno.");
  m.style.marginTop = "20px";
  m.append(S(["Atividade", "Situação", "Nota", "Retorno", ""], P(n).map(e => {
    const a = s.find(a => a.missao_id === e.id);
    return [e.titulo, a ? "corrigido" === a.status ? "Corrigida" : "A corrigir" : "Sem entrega", b(f(a?.nota)), a?.comentario_professor || "—", a ? v("Abrir entrega", "correcao/", { sala: i, entrega: a.id }, "text-button") : "—"]
  })));
  a("content").append(m)
}
function B() {
  w("Atividades da turma.", "Rascunhos para preparar. Publicadas para os alunos descobrirem.");
  a("pageActions").append(v("+ Criar atividade", "atividade/nova/", { sala: i }, "primary"));
  const e = c("select");
  e.setAttribute("aria-label", "Situação da atividade"), q(e, "Todas as atividades", ""), q(e, "Rascunhos", "rascunho"), q(e, "Publicadas", "publicado"), a("pageActions").append(e);
  const t = c("div", "", "list"); a("content").append(t);
  const o = () => {
    t.replaceChildren();
    for (const a of n.missoes.filter(a => !e.value || (a.status_publicacao || "publicado") === e.value)) {
      const e = "rascunho" === a.status_publicacao, o = c("article", "", "list-card"), r = c("div");
      r.append(c("span", e ? "Nova atividade" : "Publicada", e ? "badge" : "badge green"), c("h2", a.titulo), c("p", `${n.periodos.find(e => e.id === a.periodo_id)?.nome || "Sem período"} · ${"equipe" === a.tipo_atividade ? "Em equipe" : "Individual"} · Atividade ${a.ordem}${a.data_limite ? " · Prazo " + new Date(a.data_limite.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR") : ""}`));
      o.append(r, v(e ? "Continuar rascunho →" : "Abrir atividade →", e ? "atividade/editar/" : "atividade/", { sala: i, atividade: a.id })), t.append(o)
    }
    t.children.length || t.append(c("p", "Nenhuma atividade corresponde a este filtro.", "empty"))
  };
  e.onchange = o, o()
}
function k(e) {
  const a = c("a", e.name || "Arquivo");
  if (e.blob instanceof Blob) a.href = URL.createObjectURL(e.blob), p.push(a.href), a.download = e.name;
  else try { const t = new URL(e.url); if ("https:" !== t.protocol) return null; a.href = t.href, a.target = "_blank", a.rel = "noopener noreferrer" } catch { return null }
  return a
}
function U(e) {
  const a = Array.from(e || []), t = 1048576;
  if (a.length > 10) throw new Error("Anexe até 10 arquivos.");
  if (new Set(a.map(e => e.name + "-" + e.size)).size !== a.length) throw new Error("Um dos arquivos foi selecionado mais de uma vez.");
  let o = 0;
  for (const e of a) {
    if (!/\.(pdf|jpe?g|png|webp)$/i.test(e.name)) throw new Error(`${e.name}: escolha PDF, JPG, PNG ou WebP.`);
    if (!e.size || e.size > 20 * t) throw new Error(`${e.name}: o arquivo deve ter até 20 MB e não pode estar vazio.`);
    o += e.size
  }
  if (o > 50 * t) throw new Error("Os anexos ultrapassam 50 MB.");
  return a
}
a("menuToggle").onclick = () => {
  const e = document.body.classList.toggle("collapsed");
  a("menuToggle").setAttribute("aria-expanded", String(!e)), a("menuToggle").setAttribute("aria-label", e ? "Expandir menu" : "Recolher menu")
};
a("help").onclick = () => {
  const e = c("div");
  e.append(c("p", "Comece em Turmas. Ao abrir uma sala, consulte os alunos e gráficos. Use Atividades para criar uma proposta com PDF ou imagem, Equipes para organizar os grupos e Correções para revisar as entregas."), c("p", "Os gráficos mostram apenas dados registrados. Sem nota significa que a atividade ainda não recebeu uma avaliação."), c("p", "Esta é uma prévia local. Nenhuma turma ou correção é enviada à escola."));
  C("Sua estação de aprendizagem", e)
};
a("exit").onclick = async e => { e.preventDefault(), location.assign("../auth/login.html") };
a("topExit").onclick = () => a("exit").click();
let j = !1;
const I = e => "../aluno/atividade.html?" + new URLSearchParams({ preview: "1", sala: i, atividade: e.id });

async function V() {
  await e.editorReady();
  const o = t.get("atividade") || t.get("criada"), r = t.get("preparar") || e.uid();
  let s = o ? n.missoes.find(e => e.id === o) : n.missoes.find(e => e.chave_criacao === r);
  if (o && !s) throw new Error("Atividade não encontrada nesta turma.");
  w(s ? "Preparar a próxima descoberta." : "Uma nova descoberta.", "publicado" === s?.status_publicacao ? "As alterações salvas ficam visíveis para os alunos." : "Ao salvar, a atividade será disponibilizada aos alunos. O backend atual não possui rascunhos.");
  a("pageActions").append(v("← Atividades da turma", "atividades/", { sala: i }));
  const d = c("div", "", "editor-grid"), l = y("Proposta da atividade"), p = c("form");
  p.id = "missionForm", l.append(p), l.classList.add("form-panel");
  const h = _(p, "Título da atividade", "text", "mission-title", s?.titulo || "");
  h.required = !0, h.maxLength = 120, h.placeholder = "Ex.: Como a luz influencia uma planta?";
  const f = _(p, "Orientação para os alunos", "textarea", "mission-description", s?.descricao || "");
  f.maxLength = 1e4, f.rows = 9, f.placeholder = "Explique o objetivo, os passos e o que deve aparecer na entrega.";
  const b = c("div", "", "form-row"), x = _(b, "Período", "select", "mission-period"), A = _(b, "Prazo de entrega (opcional)", "date", "mission-date", s?.data_limite?.slice(0, 10) || "");
  n.periodos.forEach(e => q(x, e.nome, e.id)), x.value = s?.periodo_id || t.get("periodo") || n.periodos[0]?.id || "", x.required = !0, p.append(b);
  const S = _(p, "Formato da proposta", "select", "mission-mode");
  q(S, "Individual", "individual"), q(S, "Em equipe", "equipe"), S.value = s?.tipo_atividade || "individual", S.disabled = !0;
  const N = c("p", "", "hint"); p.append(N);
  const M = v("Organizar equipes deste período →", "equipes/", { sala: i }, "text-button"); p.append(M);
  const R = c("details", "", "orientation"); R.append(c("summary", "Nota e recompensas"));
  const P = c("div", "", "form-row"), $ = _(P, "Peso da nota", "number", "mission-weight", s?.peso_nota ?? 1), L = _(P, "XP da atividade", "number", "mission-xp", s?.xp_reward ?? 30);
  $.min = ".1", $.max = "10", $.step = ".1", L.min = "0", L.max = "1000", L.step = "1";
  R.append(P, c("p", "O período permite até 5 atividades, por período. A ordem é definida automaticamente.", "hint")), p.append(R);
  const z = c("div", "", "editor-materials");
  z.append(c("h2", "Materiais de apoio"), c("p", "Upload ainda indisponível no backend. Adicione links pela biblioteca da turma.", "hint"));
  const D = c("ul", "", "files-list"), T = _(z, "Escolher PDFs ou imagens", "file", "mission-files");
  T.multiple = !0, T.disabled = !0, T.accept = ".pdf,.jpg,.jpeg,.png,.webp";
  const O = c("ul", "", "files-list");
  z.append(D, O, c("p", "Até 10 arquivos · 20 MB por arquivo · 50 MB no total.", "hint")), p.append(z);
  let B = s ? await e.files(i, s.id) : [], V = [], F = new Set, H = !1;
  const Z = c("p", "", "file-note"); Z.setAttribute("role", "status"), Z.setAttribute("aria-live", "polite");
  const J = c("p", "", "error-panel"); J.setAttribute("role", "alert"), p.append(Z, J);
  const X = c("div", "", "editor-actions"), G = c("button", "Salvar e disponibilizar", "secondary"), K = g("Ver como aluno", () => ne("preview"), "secondary"), Q = g("Revisar e publicar", () => ne("publish"), "primary");
  G.type = "submit", G.id = "saveDraft", K.id = "previewMission", Q.id = "publishMission", X.append(G, K, Q), p.append(X);
  const W = y("Antes de compartilhar.", "Uma proposta clara ajuda o aluno a começar."); W.classList.add("editor-summary");
  const Y = c("span", "", "badge"), ee = c("h3"), ae = c("div", "", "editor-summary-lines");
  function te() {
    const e = "publicado" === s?.status_publicacao, a = "equipe" === S.value;
    G.textContent = e ? "Salvar alterações" : "Salvar e disponibilizar", Q.hidden = !0, Y.textContent = e ? "Publicada" : "Nova atividade", Y.className = e ? "badge green" : "badge", ee.textContent = h.value.trim() || "Sua próxima atividade";
    ae.replaceChildren(c("p", a ? "Em equipe · entrega individual" : "Individual"), c("p", n.periodos.find(e => e.id === x.value)?.nome || "Escolha um período"), c("p", A.value ? "Prazo: " + new Date(A.value + "T12:00:00").toLocaleDateString("pt-BR") : "Sem prazo de entrega"), c("p", `${B.filter(e => !F.has(e.path)).length + V.length} materiais de apoio`));
    N.textContent = a ? "Pesquisa em grupo. Cada aluno entrega seu registro e recebe nota e devolutiva individuais. Quem estiver sem equipe precisará ser incluído pelo professor antes de entregar." : "Cada aluno desenvolve e entrega sua própria investigação.";
    M.hidden = !a, M.href = m("equipes/", { sala: i }) + (m("equipes/", { sala: i }).includes("?") ? "&" : "?") + "periodo=" + encodeURIComponent(x.value), x.disabled = e, S.disabled = !0;
    const t = n.entregas.some(e => e.missao_id === s?.id); $.disabled = L.disabled = t, D.replaceChildren();
    for (const e of B) {
      const a = c("li", "", "editor-file" + (F.has(e.path) ? " staged-removal" : "")), t = k(e);
      a.append(t || c("span", e.name), g(F.has(e.path) ? "Desfazer" : "Remover", () => { F.has(e.path) ? F.delete(e.path) : F.add(e.path), j = !0, te() }, "text-button")), D.append(a)
    }
    O.replaceChildren(...V.map((e, a) => u(c("li"), c("span", e.name + " · novo"), g("Retirar", () => { V.splice(a, 1), j = !0, te() }, "text-button"))))
  }
  W.append(Y, ee, ae, c("p", "Ao salvar, os alunos da turma poderão ver esta atividade. Texto e anexos de entrega ainda dependem do backend.", "hint")), d.append(l, W), a("content").append(d);
  const oe = () => { j = !0, te() };
  async function ie() {
    const a = function () {
      const e = { titulo: h.value.trim(), descricao: f.value.trim(), periodo_id: x.value, data_limite: A.value || null, tipo_atividade: S.value, peso_nota: Number($.value), xp_reward: Number(L.value) };
      if (!e.titulo || !e.periodo_id) throw new Error("Preencha o título e escolha um período.");
      if (!Number.isFinite(e.peso_nota) || e.peso_nota < .1 || e.peso_nota > 10 || !Number.isInteger(e.xp_reward) || e.xp_reward < 0 || e.xp_reward > 1e3) throw new Error("Confira o peso da nota e o XP.");
      return e
    }();
    if (V.length) throw new Error("O backend ainda não recebe arquivos. Remova os anexos antes de salvar.");
    const o = [...B.filter(e => !F.has(e.path)), ...V];
    if (o.length > 10 || o.reduce((e, a) => e + a.size, 0) > 52428800) throw new Error("Os materiais atuais e novos ultrapassam o limite da atividade.");
    if (new Set(o.map(e => e.name + "-" + e.size)).size !== o.length) throw new Error("Um desses materiais já está anexado.");
    if (s ? s = await e.updateMission(i, s.id, { ...a, revisao: s.revisao }) : (history.replaceState(null, "", m("atividade/nova/", { sala: i, preparar: r })), t.set("preparar", r), s = await e.createMission(i, { ...a, chave_criacao: r })), !s?.id) throw new Error("Não foi possível confirmar o salvamento local.");
    t.set("atividade", s.id), history.replaceState(null, "", m("atividade/editar/", { sala: i, atividade: s.id }));
    for (const a of [...F]) await e.removeFile(i, s.id, a), F.delete(a);
    if (V.length) {
      const a = await e.files(i, s.id), t = V.filter(e => !a.some(a => a.name === e.name && a.size === e.size));
      t.length && await e.attach(i, s.id, t), V = [], T.value = ""
    }
    const n = await e.room(i);
    if (s = n.missoes.find(e => e.id === s.id), !s) throw new Error("A atividade não foi encontrada após salvar.");
    B = await e.files(i, s.id), h.value = s.titulo, f.value = s.descricao || "", x.value = s.periodo_id, S.value = s.tipo_atividade || "individual", A.value = s.data_limite?.slice(0, 10) || "", $.value = s.peso_nota, L.value = s.xp_reward, j = !1, te();
    Z.textContent = "publicado" === s.status_publicacao ? "Alterações salvas na atividade publicada." : "Rascunho salvo. Ainda não aparece para os alunos."
  }
  async function ne(t) {
    if (!H) {
      H = !0, [G, K, Q].forEach(e => e.disabled = !0), a("refresh").disabled = !0, J.textContent = "";
      try {
        if ("publish" === t && !f.value.trim()) throw new Error("Escreva a orientação para os alunos antes de publicar.");
        if (Z.textContent = "Salvando proposta e materiais…", await ie(), "preview" === t) return void location.assign(I(s));
        if ("publish" === t) {
          const t = c("div");
          t.append(c("p", "Confira a proposta antes de liberar para os alunos."), c("h3", s.titulo), c("p", s.descricao, "document-copy"), c("p", `${"equipe" === S.value ? "Em equipe, com entrega individual" : "Individual"} · ${n.periodos.find(e => e.id === s.periodo_id)?.nome} · ${B.length} materiais.`, "hint"));
          const o = c("a", "Ver a tela do aluno", "secondary"); o.href = I(s);
          t.append(o, g("Publicar na prévia", () => E(async () => {
            const t = await e.publishMission(i, s.id, s.revisao);
            if ("publicado" !== t.status_publicacao) throw new Error("Publicação não confirmada.");
            s = t, a("actionDialog").close(), Z.textContent = "Atividade publicada na prévia local.", te()
          }), "primary")), C("Tudo pronto para compartilhar?", t)
        }
      } catch (a) {
        if (J.textContent = (s ? "A atividade já existe; confira as alterações pendentes. " : "") + a.message, Z.textContent = "", s) try {
          const a = (await e.room(i)).missoes.find(e => e.id === s.id);
          a && ["titulo", "descricao", "periodo_id", "tipo_atividade", "peso_nota", "xp_reward"].every(e => a[e] === s[e]) && (a.data_limite || "").slice(0, 10) === (s.data_limite || "").slice(0, 10) && (s = a, B = await e.files(i, s.id), V = V.filter(e => !B.some(a => a.name === e.name && a.size === e.size)), F = new Set([...F].filter(e => B.some(a => a.path === e))), te())
        } catch { }
      } finally {
        H = !1, [G, K, Q].forEach(e => e.disabled = !n.periodos.length), a("refresh").disabled = !1
      }
    }
  }
  [h, f, x, A, S, $, L].forEach(e => e.oninput = oe), x.onchange = S.onchange = oe;
  T.onchange = () => { try { V = U(T.files), J.textContent = "", j = !0, te() } catch (e) { J.textContent = e.message, V = [], T.value = "", te() } };
  p.onsubmit = e => (e.preventDefault(), ne("save"));
  n.periodos.length || ([G, K, Q].forEach(e => e.disabled = !0), J.textContent = "Crie um período na sala antes de preparar a atividade.");
  te()
}

function F() {
  w("Equipes da turma.", "Organize grupos por período, com os alunos cadastrados nesta sala.");
  a("pageActions").append(g("+ Criar equipe", () => {
    const o = c("form"), r = _(o, "Nome da equipe", "text", "team-name"), s = _(o, "Período", "select", "team-period");
    r.required = !0, r.maxLength = 80, s.required = !0, n.periodos.forEach(e => q(s, e.nome, e.id)), t.get("periodo") && (s.value = t.get("periodo"));
    const d = c("button", "Criar equipe", "primary"); d.type = "submit", d.disabled = !n.periodos.length;
    o.append(c("p", n.periodos.length ? "Depois da criação, escolha os integrantes." : "Crie um período na sala antes de formar a equipe.", "hint"), d);
    o.onsubmit = t => {
      t.preventDefault(), E(async () => {
        if (!r.value.trim() || !s.value) throw new Error("Informe o nome e o período.");
        d.disabled = !0;
        try {
          const t = await e.createTeam(i, { nome: r.value.trim(), periodo_id: s.value });
          a("actionDialog").close(), await G(), await H(t.id)
        } finally { d.disabled = !1 }
      })
    };
    C("Uma nova equipe", o)
  }, "primary"));
  const o = c("div", "", "team-grid");
  n.equipes.forEach(e => { const a = y(e.nome, n.periodos.find(a => a.id === e.periodo_id)?.nome || "Período da turma"); a.classList.add("team-card"), a.append(g("Ver integrantes e organizar →", () => H(e.id))), o.append(a) });
  a("content").append(o), n.equipes.length || a("content").append(c("p", "Nenhuma equipe criada neste período.", "empty"))
}
async function H(a) {
  try {
    const t = await e.team(i, a), o = c("div");
    o.append(c("p", `${t.membros.length} integrante${1 === t.membros.length ? "" : "s"}. Até 4 integrantes. O aluno pode pertencer a uma equipe por período.`));
    t.membros.forEach(t => {
      const n = c("div", "", "member");
      n.append(c("span", t.nome), g("Remover", () => {
        const o = c("div");
        o.append(c("p", `Remover ${t.nome} desta equipe? O aluno continuará cadastrado na turma.`), g("Confirmar remoção", () => E(async () => { await e.removeMember(i, a, t.id), await H(a) }), "primary"));
        C("Revisar remoção", o)
      }, "text-button")), o.append(n)
    });
    const n = c("form"), r = _(n, "Adicionar aluno da turma", "select", "team-student");
    t.alunos_disponiveis.forEach(e => q(r, e.nome, e.id));
    const s = c("button", "Adicionar integrante", "primary");
    s.type = "submit", s.disabled = !t.alunos_disponiveis.length || t.membros.length >= 4, n.append(s);
    n.onsubmit = t => { t.preventDefault(), E(async () => { if (!r.value) throw new Error("Selecione um aluno disponível."); await e.addMember(i, a, r.value), await H(a) }) };
    o.append(n), t.alunos_disponiveis.length || o.append(c("p", "Todos os alunos já estão em equipes deste período.", "hint")), C(t.equipe.nome, o)
  } catch (e) { h(e) }
}
function Z() {
  w("Correções da sala.", "Um retorno claro ajuda o aluno a avançar na próxima descoberta.");
  const e = y("Entregas dos alunos"), o = c("div", "", "filters"), r = c("input"), s = c("select");
  r.type = "search", r.placeholder = "Buscar aluno ou atividade…", r.setAttribute("aria-label", "Buscar entrega"), s.setAttribute("aria-label", "Situação da entrega"), q(s, "A corrigir", "entregue"), q(s, "Todas as entregas", ""), q(s, "Corrigidas", "corrigido");
  const d = c("div"); o.append(r, s), e.append(o, d), a("content").append(e);
  const l = () => {
    const e = r.value.toLowerCase(), a = t.get("atividade"), o = n.entregas.filter(t => (!s.value || t.status === s.value) && (!a || t.missao_id === a) && `${t.perfis?.nome || ""} ${t.titulo_missao || ""}`.toLowerCase().includes(e));
    d.replaceChildren(S(["Aluno", "Atividade", "Situação", "Nota", ""], o.map(e => [e.perfis?.nome || n.alunos.find(a => a.id === e.aluno_id)?.nome || "Aluno", e.titulo_missao || n.missoes.find(a => a.id === e.missao_id)?.titulo || "Atividade", "corrigido" === e.status ? "Corrigida" : "A corrigir", b(f(e.nota)), v("Abrir entrega", "correcao/", { sala: i, entrega: e.id }, "text-button")])));
    o.length || d.append(c("p", "Nenhuma entrega corresponde a estes filtros.", "empty"))
  };
  r.oninput = l, s.onchange = l, l()
}
let J = !1;
function X(e) { if (!e) return "Data não informada"; const a = new Date(e); return Number.isNaN(a.getTime()) ? "Data não informada" : a.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) }

async function G() {
  const s = ++l;
  A(), a("content").replaceChildren(), a("content").setAttribute("aria-busy", "true"), a("error").textContent = "", a("pageActions").replaceChildren(), a("refresh").disabled = !0, a("mode").textContent = "ÁREA DO PROFESSOR", a("modeNote").textContent = "Dados da sua conta. Atualize para consultar as alterações dos alunos.";
  (function () {
    const e = [["rooms", "Turmas", "", {}, "M3 5h18v16H3ZM7 9h3m4 0h3M7 14h3m4 0h3"]];
    i && e.push(
      ["room", "Sala", "sala/", { sala: i }, "M3 10 12 3l9 7v10H3Zm6 10v-7h6v7"],
      ["activities", "Atividades", "atividades/", { sala: i }, "M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5"],
      ["teams", "Equipes", "equipes/", { sala: i }, "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a4 4 0 0 1 0 8m2 2a6 6 0 0 1 3 5v2"],
      ["corrections", "Correções", "correcoes/", { sala: i }, "M8 3H4v18h16V3h-4M8 2h8v4H8Zm0 11 3 3 5-6"]);
    i && e.push(["questions", "Perguntas", "perguntas/", { sala: i }, "M3 4h18v13H8l-5 4Zm4 4h10M7 12h6"]);
    e.push(["notifications", "Notificações", "notificacoes/", {}, "M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4"]);

    /* Biblioteca aparece somente quando existe uma turma selecionada. */
    i && e.splice(3, 0, ["library", "Biblioteca", "biblioteca/", { sala: i }, "M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3Zm10 3a3 3 0 0 1 3-3h5v14h-5a3 3 0 0 0-3 3"]);

    a("mainNav").replaceChildren();
    for (const [t, i, n, r, s] of e) {
      const e = v("", n, r, ""); e.setAttribute("aria-label", i);
      const d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      d.setAttribute("viewBox", "0 0 24 24"), d.setAttribute("aria-hidden", "true");
      const l = document.createElementNS(d.namespaceURI, "path"); l.setAttribute("d", s), d.append(l), e.append(d, c("span", i, "label"));
      (t === o || "room" === t && "student" === o || "activities" === t && ["activity", "create"].includes(o) || "corrections" === t && "review" === o) && (e.classList.add("active"), e.setAttribute("aria-current", "page"));
      a("mainNav").append(e)
    }
    a("brandHome").href = m("")
  })();
  try {
    if (r = await e.rooms(), s !== l) return;
    if ("rooms" === o) n = null, D(), await L(s);
    else if ("notifications" === o) n = null, D(), await async function (t) {
      w("Sua caixa de avisos.", "Entregas e perguntas das suas turmas, organizadas em um só lugar.");
      const o = await e.notifications(!1); if (t !== l) return;
      const i = c("div", "", "filters"), n = c("select"), r = c("select");
      n.setAttribute("aria-label", "Situação da notificação"), r.setAttribute("aria-label", "Tipo da notificação"), q(n, "Não lidas", "unread"), q(n, "Todas", "all"), q(r, "Todos os tipos", ""), q(r, "Entregas", "entrega"), q(r, "Perguntas", "pergunta"), i.append(n, r);
      const s = g("Marcar exibidas como lidas", async () => {
        s.disabled = !0;
        try {
          const t = o.notificacoes.filter(p).map(e => e.id);
          await e.readNotifications(t), window.dispatchEvent(new Event("astro-notifications-refresh")), await G(), a("status").textContent = "Avisos marcados como lidos nesta prévia."
        } catch (e) { h(e), s.disabled = !1 }
      }, "secondary");
      i.append(s);
      a("pageActions").append(g("Simular nova entrega", async () => { try { await e.simulateDelivery(), await G(), window.dispatchEvent(new Event("astro-notifications-refresh")) } catch (e) { h(e) } }, "secondary"));
      a("content").append(i);
      const d = c("div", "", "notification-page");
      function p(e) { return !("all" !== n.value && e.lida_em || r.value && e.tipo !== r.value) }
      function u() {
        d.replaceChildren();
        const a = o.notificacoes.filter(p); s.disabled = !a.some(e => !e.lida_em);
        for (const t of a) {
          const a = y(t.titulo, t.mensagem);
          a.classList.add("notification-card"), a.append(c("span", t.lida_em ? "Lida" : "Não lida", t.lida_em ? "badge" : "badge gold"), c("p", X(t.criado_em), "hint"));
          const o = { sala: t.sala_id };
          "entrega" === t.tipo ? o.entrega = t.entrega_id : o.pergunta = t.pergunta_id;
          const i = v("entrega" === t.tipo ? "Abrir entrega →" : "Ver pergunta →", "entrega" === t.tipo ? "correcao/" : "perguntas/", o);
          i.onclick = async a => { a.preventDefault(); try { await e.readNotifications([t.id]), location.assign(i.href) } catch (a) { h(a) } };
          a.append(i), d.append(a)
        }
        a.length || d.append(c("p", "Tudo em dia. Nenhum aviso corresponde a este filtro.", "empty"))
      }
      a("content").append(d), n.onchange = r.onchange = u, u()
    }(s);
    else {
      if (!i) return w("Escolha uma turma.", "Abra a sala antes de consultar esta área."), n = null, D(), void await L(s);
      if (n = await e.room(i), "room" === o) {
        const e = c("a", "Materiais da biblioteca", "secondary");
        e.href = "biblioteca.html?sala=" + encodeURIComponent(i), a("pageActions").append(e)
      }
      if (s !== l) return;
      D();
      (function () {
        if (!["room", "student", "activities", "teams", "corrections"].includes(o) || !n.periodos.length) return;
        const e = t.get("periodo") || "", i = c("select");
        i.setAttribute("aria-label", "Filtrar por período"), q(i, "Todos os períodos", ""), n.periodos.forEach(e => q(i, e.nome, e.id)), i.value = e;
        i.onchange = () => { i.value ? t.set("periodo", i.value) : t.delete("periodo"), history.replaceState(null, "", location.pathname + "?" + t), G() };
        a("pageActions").append(i);
        const r = new Map((n.pauta.periodos || n.periodos).map((e, a) => [e.id, a]));
        if (n.missoes = [...n.missoes].sort((e, a) => (r.get(e.periodo_id) || 0) - (r.get(a.periodo_id) || 0) || (Number(e.ordem) || 0) - (Number(a.ordem) || 0)), !e) return;
        if (!n.periodos.some(a => a.id === e)) throw new Error("Período não encontrado nesta turma.");
        n.missoes = n.missoes.filter(a => a.periodo_id === e);
        const s = new Set(n.missoes.map(e => e.id));
        n.entregas = n.entregas.filter(e => s.has(e.missao_id)), n.equipes = n.equipes.filter(a => a.periodo_id === e);
        n.pauta = {
          ...n.pauta, pauta_data: n.pauta.pauta_data.map(e => {
            let a = 0, t = 0;
            return n.missoes.forEach(o => { const i = f(e.notas?.[o.id]); if (null !== i) { const e = Number(o.peso_nota) || 1; a += i * e, t += e } }), { ...e, media_missoes: t ? a / t : null, media: t ? a / t : null }
          })
        }
      })();
      await ({
        room: T,
        student: O,
        activities: B,
        activity: () => async function (o) {
          const r = n.missoes.find(e => e.id === t.get("atividade"));
          if (!r) throw new Error("Atividade não encontrada nesta sala.");
          w(r.titulo, "rascunho" === r.status_publicacao ? "Rascunho privado do professor." : "Orientação e materiais publicados para esta turma.");
          a("pageActions").append(v("Editar proposta", "atividade/editar/", { sala: i, atividade: r.id }, "primary"));
          const s = c("a", "Ver como aluno", "secondary"); s.href = I(r), a("pageActions").append(s);
          a("pageActions").append(v("Ver entregas", "correcoes/", { sala: i, atividade: r.id }, "primary"), v("Voltar às atividades", "atividades/", { sala: i }));
          const d = y("Orientação da atividade"); d.append(c("p", r.descricao || "Sem orientação cadastrada.", "document-copy"));
          const p = y("PDFs e imagens da atividade", "Arquivos do professor para apoiar a investigação."), m = c("ul", "", "files-list");
          p.append(m), a("content").append(u(c("div", "", "two-columns"), d, p));
          try {
            const a = await e.files(i, r.id); if (o !== l) return;
            a.forEach(e => { const a = k(e); a && m.append(u(c("li"), a, c("span", `${Math.ceil((e.size || 0) / 1024)} KB`, "small-label"))) }), a.length || m.append(c("li", "Nenhum arquivo anexado."))
          } catch (e) { p.append(c("p", e.message, "hint")) }
          const g = c("form"), f = _(g, "Adicionar PDF ou imagem", "file", "extra-files");
          f.multiple = !0, f.disabled = !0, f.accept = ".pdf,.jpg,.jpeg,.png,.webp";
          const b = c("button", "Adicionar materiais", "secondary"); b.type = "submit";
          g.append(c("p", "Até 10 arquivos, 20 MB por arquivo e 50 MB no total.", "hint"), b);
          g.onsubmit = async t => {
            t.preventDefault(), b.disabled = !0;
            try { const t = U(f.files); if (!t.length) throw new Error("Escolha pelo menos um arquivo."); await e.attach(i, r.id, t), a("status").textContent = "Materiais salvos na prévia local.", await G() } catch (t) { h(t) } finally { b.disabled = !1 }
          };
          p.append(g)
        }(s),
        create: () => V(),
        teams: F,
        corrections: Z,
        review: () => async function (o) {
          const r = n.entregas.find(e => e.id === t.get("entrega"));
          if (!r) throw new Error("Entrega não encontrada nesta turma.");
          const s = await e.delivery(r.id); if (o !== l) return;
          const d = n.missoes.find(e => e.id === r.missao_id), u = s.perfis || n.alunos.find(e => e.id === r.aluno_id);
          w("Um retorno que faz avançar.", `${u?.nome || "Aluno"} · ${d?.titulo || r.titulo_missao || "Atividade"}`);
          a("pageActions").append(v("← Todas as entregas", "correcoes/", { sala: i }, "secondary"), v("Histórico do aluno", "aluno/", { sala: i, aluno: r.aluno_id || u?.id }, "text-button"));
          const m = c("div", "", "review-grid"), h = c("div", "", "stack"), b = y("Trabalho do aluno"), x = c("div", "", "review-meta");
          x.append(c("span", "corrigido" === s.status ? "Correção registrada" : "Aguardando correção", "corrigido" === s.status ? "badge green" : "badge gold"), c("span", "Entregue em " + X(s.entregue_em), "small-label"));
          b.append(x, c("p", s.resposta_entrega || "O backend registra apenas a realização. Solicite o trabalho pelo meio combinado; texto e arquivos ainda não são recebidos pela API.", "document-copy"));
          const A = c("details", "", "orientation");
          A.append(c("summary", "Relembrar a orientação da atividade"), c("p", d?.descricao || "Sem orientação cadastrada.", "document-copy")), b.append(A), h.append(b);
          const C = y("Anexos da entrega", "PDFs e imagens podem ser visualizados aqui. Outros documentos ficam disponíveis para baixar."), E = c("div", "", "review-file-list"), q = c("div", "", "file-preview");
          C.append(E, q), h.append(C);
          const S = s.anexos || [];
          let N = null;
          for (const e of S) {
            const a = k(e); if (!a) continue;
            a.className = "text-button", a.textContent = "Baixar";
            const t = c("div", "", "review-file"), o = c("div");
            if (o.append(c("strong", e.name), c("small", Math.ceil((e.size || 0) / 1024) + " KB")), t.append(o, a), ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(e.type)) {
              let a = null;
              if (e.blob instanceof Blob) a = URL.createObjectURL(e.blob), p.push(a);
              else try { const t = new URL(e.preview_url || e.url); "https:" === t.protocol && (a = t.href) } catch { }
              if (a) {
                const o = () => {
                  if (q.replaceChildren(), E.querySelectorAll("button").forEach(e => e.setAttribute("aria-pressed", "false")), i.setAttribute("aria-pressed", "true"), q.append(c("p", e.name, "small-label")), "application/pdf" === e.type) {
                    const t = c("iframe"); t.title = "Visualização de " + e.name, t.src = a, q.append(t, c("p", "Se o PDF não abrir, use Baixar. Para renovar o acesso aos anexos, atualize a página.", "hint"))
                  } else {
                    const t = c("img"); t.alt = "Anexo do aluno: " + e.name, t.src = a, q.append(t)
                  }
                }, i = g("Visualizar", o, "secondary");
                i.setAttribute("aria-pressed", "false"), t.append(i), N ??= o
              }
            }
            E.append(t)
          }
          S.length || C.append(c("p", "Nenhum arquivo anexado.", "empty")), N && N();
          const M = y("Sua devolutiva", "Avalie o processo e indique um próximo passo."); M.classList.add("review-evaluation");
          const R = c("form"); R.id = "reviewForm";
          const P = _(R, "Nota · de 0 a 10", "number", "delivery-grade", s.nota ?? ""), $ = _(R, "Orientação ao aluno", "textarea", "delivery-feedback", s.comentario_professor || "");
          P.required = !0, P.min = "0", P.max = "10", P.step = ".1", $.maxLength = 3e3, $.rows = 8, $.placeholder = "O que foi bem feito? O que pode melhorar? Qual é o próximo passo?";
          const L = c("p", `${$.value.length} / 3.000 caracteres`, "hint"), z = c("p", "", "hint"); R.append(L, z);
          const D = `astrolearn-review-demo-${r.id}`;
          if ("corrigido" !== s.status) try {
            const e = JSON.parse(sessionStorage.getItem(D));
            e && (P.value = e.nota ?? "", $.value = e.feedback || "", L.textContent = $.value.length + " / 3.000 caracteres", z.textContent = "Rascunho recuperado nesta aba.", J = !0)
          } catch { }
          const T = c("button", "Salvar correção da prévia", "primary"), O = c("p", "", "error-panel");
          T.type = "submit", O.setAttribute("role", "alert");
          R.append(c("p", "Somente demonstração. Nenhum aluno real receberá esta correção.", "hint"), T, O);
          P.oninput = $.oninput = () => {
            J = !0, L.textContent = $.value.length + " / 3.000 caracteres";
            try { sessionStorage.setItem(D, JSON.stringify({ nota: P.value, feedback: $.value })), z.textContent = "Rascunho salvo nesta aba." } catch { z.textContent = "Alterações mantidas somente nesta visita." }
          };
          const B = c("details", "", "orientation");
          B.append(c("summary", "Como escrever uma boa devolutiva"), c("p", "Reconheça uma escolha acertada, explique uma melhoria concreta e proponha um próximo passo. Exemplo: “Você manteve a água igual nas duas plantas. Agora registre a altura diariamente para comparar os resultados.”", "hint"));
          M.append(R, B);
          const U = () => {
            P.disabled = $.disabled = T.disabled = !0, T.textContent = "Correção registrada", J = !1, z.textContent = "Nota e devolutiva registradas.";
            try { sessionStorage.removeItem(D) } catch { }
            const e = n.entregas.find(e => "entregue" === e.status && e.id !== r.id), a = c("div", "", "button-row");
            e && a.append(v("Próxima entrega →", "correcao/", { sala: i, entrega: e.id }, "primary")), a.append(v("Voltar à fila", "correcoes/", { sala: i })), M.append(a)
          };
          "corrigido" === s.status && U();
          R.onsubmit = async t => {
            if (t.preventDefault(), T.disabled) return;
            const o = f(P.value);
            if (null === o || o < 0 || o > 10) return O.textContent = "Informe uma nota entre 0 e 10.", void P.focus();
            T.disabled = !0, a("refresh").disabled = !0, O.textContent = "";
            try {
              await e.correct(r.id, o, $.value.trim()), U(), a("status").textContent = "Correção salva na prévia local.", window.dispatchEvent(new window.Event("astro-notifications-refresh"))
            } catch (t) {
              let i = !1;
              try { const a = await e.delivery(r.id); i = "corrigido" === a.status && f(a.nota) === o && (a.comentario_professor || "") === $.value.trim() } catch { }
              i ? (U(), a("status").textContent = "Consulta concluída: esta correção já está registrada.") : (O.textContent = t.message, T.disabled = !1)
            } finally { a("refresh").disabled = !1 }
          };
          m.append(h, M), a("content").append(m)
        }(s),
        questions: () => async function (o) {
          const r = await e.questions(i); if (o !== l) return;
          w("Perguntar também é aprender.", "Conversas privadas dos alunos com o professor, organizadas por atividade.");
          const s = r.filter(e => !e.resposta).length;
          a("content").append(u(c("section", "", "stats"), x("Aguardando resposta", s), x("Respondidas", r.length - s), x("Perguntas nesta turma", r.length)));
          a("pageActions").append(v("← Voltar à sala", "sala/", { sala: i }));
          const d = c("a", "Testar pergunta como aluno ↗", "secondary"); d.href = "../aluno/atividade.html?missao=1", a("pageActions").append(d);
          const p = c("div", "", "filters"), m = c("input"), g = c("select");
          m.type = "search", m.placeholder = "Buscar aluno, atividade ou pergunta…", m.setAttribute("aria-label", "Buscar pergunta"), g.setAttribute("aria-label", "Situação da pergunta"), q(g, "Sem resposta", "pending"), q(g, "Todas", "all"), q(g, "Respondidas", "answered"), t.get("pergunta") && (g.value = "all"), p.append(m, g), a("content").append(p);
          const h = c("div", "", "question-list"), f = c("p", "Nenhuma pergunta corresponde aos filtros.", "empty"); a("content").append(h, f);
          const b = [];
          for (const o of r) {
            const i = y(o.perfis?.nome || n.alunos.find(e => e.id === o.aluno_id)?.nome || "Aluno", (o.missoes?.titulo || n.missoes.find(e => e.id === o.missao_id)?.titulo || "Atividade") + " · " + X(o.criado_em));
            i.id = "pergunta-" + o.id, i.classList.add("question-card"), t.get("pergunta") === o.id && i.classList.add("question-highlight"), i.append(c("p", o.texto, "document-copy"));
            const s = c("div", "", "teacher-reply"); i.append(s);
            const d = () => { s.replaceChildren(c("strong", "Sua resposta"), c("p", o.resposta, "document-copy"), c("small", X(o.respondida_em))) };
            if (o.resposta) d();
            else {
              s.hidden = !0;
              const t = c("form"), n = _(t, "Responder ao aluno", "textarea", "reply-" + o.id);
              n.required = !0, n.maxLength = 3e3, n.rows = 3;
              const l = c("button", "Responder na prévia", "primary"), p = c("p", "", "error-panel");
              l.type = "submit", p.setAttribute("role", "alert"), t.append(c("p", "A resposta fica visível somente para este aluno e o professor.", "hint"), l, p), i.append(t);
              t.onsubmit = async i => {
                if (i.preventDefault(), !l.disabled)
                  if (n.value.trim()) {
                    l.disabled = !0, p.textContent = "";
                    try {
                      const i = await e.answer(o.id, n.value.trim());
                      if (!i.pergunta?.id) throw new Error("A resposta não foi confirmada.");
                      Object.assign(o, i.pergunta), t.hidden = !0, s.hidden = !1, d(), a("status").textContent = "Resposta salva na prévia.", A();
                      const l = a("content").querySelectorAll(".stats strong");
                      l[0].textContent = r.filter(e => !e.resposta).length, l[1].textContent = r.filter(e => e.resposta).length
                    } catch (i) { p.textContent = i.message, l.disabled = !1 }
                  } else p.textContent = "Escreva uma orientação para o aluno."
              }
            }
            h.append(i), b.push({ p: i, q: o })
          }
          function A() {
            let e = 0;
            const a = m.value.trim().toLowerCase();
            b.forEach(({ p: t, q: o }) => {
              const i = "all" === g.value || "pending" === g.value && !o.resposta || "answered" === g.value && o.resposta;
              t.hidden = !i || !`${o.perfis?.nome || ""} ${o.missoes?.titulo || ""} ${o.texto}`.toLowerCase().includes(a), t.hidden || e++
            });
            f.hidden = e > 0
          }
          m.oninput = g.onchange = A, A();
          t.get("pergunta") && document.getElementById("pergunta-" + t.get("pergunta"))?.scrollIntoView?.({ block: "center", behavior: "instant" })
        }(s)
      }[o]?.())
    }
  } catch (e) {
    s === l && (h(e), a("content").replaceChildren(u(c("section", "", "panel"), c("p", "Não foi possível carregar esta página. Seus dados não foram substituídos por exemplos."), v("Voltar às turmas", "", {}, "primary"))))
  } finally {
    s === l && (a("refresh").disabled = !1, a("content").setAttribute("aria-busy", "false"))
  }
}

window.addEventListener("beforeunload", e => { (J || j) && (e.preventDefault(), e.returnValue = "") });
a("refresh").onclick = () => { (!J && !j || window.confirm("Atualizar a página? Salve os rascunhos e arquivos antes de atualizar.")) && G() };
window.addEventListener("pagehide", A);
G();
})();