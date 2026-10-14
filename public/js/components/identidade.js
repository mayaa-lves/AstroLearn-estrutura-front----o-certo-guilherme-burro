import { obterSessao } from "../services/autenticacao.js";
const nome = obterSessao()?.usuario.nome || "Explorador";
const e = document.getElementById("welcomeTitle");
if (e) e.textContent = "Boas-vindas, " + nome + "!";
document
  .querySelectorAll("[data-student-name]")
  .forEach((e) => (e.textContent = nome));
