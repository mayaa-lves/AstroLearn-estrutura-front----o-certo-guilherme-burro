/* Menu das composições aprovadas: ícones no computador e Mais no celular. */
(() => {
  "use strict";
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("menuToggle");
  if (!sidebar || !toggle) return;
  const key = "astrolearn-menu";
  let compact =
    document.body.classList.contains("collapsed") ||
    document.body.classList.contains("menu-collapsed");
  try {
    const saved = localStorage.getItem(key);
    if (saved) compact = saved === "recolhido";
  } catch {}
  const home = document.querySelector(".app") !== null;
  function apply() {
    document.body.classList.toggle("collapsed", compact);
    document.body.classList.toggle("menu-collapsed", compact);
    toggle.setAttribute("aria-expanded", String(!compact));
    toggle.setAttribute(
      "aria-label",
      compact ? "Expandir menu" : "Recolher menu",
    );
    if (!home) toggle.textContent = compact ? "›" : "‹";
  }
  toggle.addEventListener("click", () => {
    compact = !compact;
    apply();
    try {
      localStorage.setItem(key, compact ? "recolhido" : "aberto");
    } catch {}
  });
  apply();

  const base = sidebar.dataset.base || "";
  const links = [
    ["home.html", "Início"],
    ["home.html#journey", "Minha trilha"],
    ["biblioteca.html", "Biblioteca"],
    ["conquistas.html", "Conquistas"],
    ["loja.html", "Loja"],
    ["equipe.html", "Minha equipe"],
    ["perfil.html", "Perfil"],
    ["jogos/index.html", "Jogos"],
    ["configuracoes.html", "Configurações"],
  ];
  const nav = sidebar.querySelector("nav");
  // Mesma ordem em todas as telas; mover o elemento preserva seus eventos.
  for (const [, label] of links) {
    const item = [...nav.children].find(
      (element) => element.getAttribute("aria-label") === label,
    );
    if (item) nav.append(item);
    else {
      const a = document.createElement("a");
      a.className = "nav-item";
      a.href = base + links.find((entry) => entry[1] === label)[0];
      a.setAttribute("aria-label", label);
      a.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        (label === "Jogos"
          ? '<path d="M5 7h14l3 10-3 3-5-4h-4l-5 4-3-3ZM7 10v6m-3-3h6m6-2h1m1 3h1"/>'
          : '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>') +
        '</svg><span class="label"></span>';
      a.querySelector(".label").textContent = label;
      if (
        location.pathname.endsWith(
          "/" +
            base.replace("../", "") +
            links.find((entry) => entry[1] === label)[0],
        ) ||
        (label === "Jogos" && location.pathname.includes("/aluno/jogos/"))
      ) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      nav.append(a);
    }
  }
  const more = document.createElement("button");
  more.type = "button";
  more.className = "mobile-more nav-item";
  more.setAttribute("aria-haspopup", "dialog");
  more.setAttribute("aria-controls", "menu-mobile-dialog");
  more.setAttribute("aria-label", "Mais páginas");
  more.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg><span class="label">Mais</span>';
  nav.append(more);
  const dialog = document.createElement("dialog");
  dialog.id = "menu-mobile-dialog";
  dialog.className = "mobile-navigation";
  dialog.setAttribute("aria-labelledby", "menu-mobile-title");
  const title = document.createElement("h2");
  title.id = "menu-mobile-title";
  title.textContent = "Sua expedição";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "mobile-navigation-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Fechar navegação");
  const list = document.createElement("nav");
  list.setAttribute("aria-label", "Todas as páginas do aluno");
  for (const [href, label] of links) {
    const a = document.createElement("a");
    a.href = base + href;
    a.textContent = label;
    list.append(a);
    a.addEventListener("click", () => dialog.close());
  }
  dialog.append(close, title, list);
  document.body.append(dialog);
  more.addEventListener("click", () => dialog.showModal());
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => more.focus());
  matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
    if (event.matches && dialog.open) dialog.close();
  });
})();
