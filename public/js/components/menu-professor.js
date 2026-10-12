/* Mantém o menu docente entre visitas; a lista móvel acompanha a sala atual. */
(() => {
  const toggle = document.getElementById("menuToggle"),
    nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  let closed = false;
  try {
    closed = localStorage.getItem("astrolearn-teacher-menu") === "recolhido";
  } catch {}
  function apply() {
    document.body.classList.toggle("collapsed", closed);
    toggle.setAttribute("aria-expanded", String(!closed));
    toggle.setAttribute(
      "aria-label",
      closed ? "Expandir menu" : "Recolher menu",
    );
    toggle.textContent = closed ? "›" : "‹";
  }
  toggle.onclick = () => {
    closed = !closed;
    apply();
    try {
      localStorage.setItem(
        "astrolearn-teacher-menu",
        closed ? "recolhido" : "aberto",
      );
    } catch {}
  };
  apply();
  const d = document.createElement("dialog");
  d.id = "teacherMobileMenu";
  d.className = "teacher-mobile-dialog";
  d.setAttribute("aria-labelledby", "teacherMobileTitle");
  d.innerHTML =
    '<button type="button" class="close" aria-label="Fechar navegação">×</button><h2 id="teacherMobileTitle">Sua estação</h2><nav aria-label="Todas as páginas do professor"></nav>';
  document.body.append(d);
  const more = document.createElement("button");
  more.className = "mobile-teacher-more";
  more.type = "button";
  more.setAttribute("aria-label", "Mais páginas");
  more.setAttribute("aria-controls", d.id);
  more.setAttribute("aria-haspopup", "dialog");
  more.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg><span>Mais</span>';
  function mount() {
    if (!more.isConnected) nav.append(more);
  }
  new MutationObserver(mount).observe(nav, { childList: true });
  mount();
  more.onclick = () => {
    const list = d.querySelector("nav");
    list.replaceChildren();
    nav.querySelectorAll("a").forEach((a) => list.append(a.cloneNode(true)));
    const exit = document.createElement("a");
    exit.href = "../auth/login.html";
    exit.textContent = "Voltar ao login";
    list.append(exit);
    d.showModal();
  };
  d.querySelector("button").onclick = () => d.close();
  d.addEventListener("close", () => more.focus());
  matchMedia("(min-width:801px)").addEventListener("change", (e) => {
    if (e.matches && d.open) d.close();
  });
})();
