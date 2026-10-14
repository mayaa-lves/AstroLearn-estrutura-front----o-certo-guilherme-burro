import { sessaoObrigatoria, encerrar } from "../services/conexao.js";
const preview =
  location.pathname.endsWith("/aluno/atividade.html") &&
  new URLSearchParams(location.search).get("preview") === "1";
const role =
  location.pathname.includes("/professor/") || preview ? "professor" : "aluno";
const s = sessaoObrigatoria(role);
document
  .querySelectorAll("[data-student-name]")
  .forEach((e) => (e.textContent = s.usuario.nome || "Explorador"));
const welcome = document.getElementById("welcomeTitle");
if (welcome)
  welcome.textContent =
    "Boas-vindas, " + (s.usuario.nome || "Explorador") + "!";
document.addEventListener(
  "click",
  (e) => {
    const a = e.target.closest("a");
    if (a?.href && new URL(a.href).pathname.endsWith("/auth/login.html")) {
      e.preventDefault();
      encerrar();
    }
  },
  true,
);
const nav = document.querySelector(
  ".sidebar nav, .app-menu .menu-links, #mainNav",
);
if (
  nav &&
  ![...nav.querySelectorAll("a")].some((a) =>
    a.href.includes("/auth/login.html"),
  )
) {
  const a = document.createElement("a");
  a.href = new URL("../../../auth/login.html", import.meta.url);
  a.className = "nav-item";
  a.textContent = "Sair";
  nav.append(a);
}
