import { sessaoObrigatoria, api } from "../services/conexao.js";
import { dashboard } from "../services/aluno.js";
import { CONFIG } from "../config.js";
const s = sessaoObrigatoria("aluno");
document
  .querySelectorAll(".school-details strong")
  .forEach((e) => (e.textContent = "Carregando…"));
const name = document.getElementById("studentName");
name.textContent = s.usuario.nome;
const info = document.querySelector(".identity-copy p");
info.textContent = s.usuario.email || "Aluno";
document.querySelector(".identity-actions small").textContent =
  "Dados da conta";
const edit = document.getElementById("editName");
edit.disabled = true;
edit.title = "Atualização de nome ainda depende do backend";
const note = document.createElement("p");
note.textContent =
  "As preferências de acessibilidade e o visual escolhido ficam neste navegador. Alterações de nome e roupas ainda não são sincronizadas com sua conta.";
document.querySelector(".identity-card").after(note);
const input = document.createElement("input");
input.type = "file";
input.accept = "image/png,image/jpeg,image/webp,image/gif";
input.id = "avatarFile";
const label = document.createElement("label");
label.htmlFor = input.id;
label.textContent = "Enviar imagem de perfil";
const status = document.createElement("p");
status.setAttribute("role", "status");
document.querySelector(".identity-actions").append(label, input, status);
input.onchange = async () => {
  const f = input.files[0];
  if (!f) return;
  if (f.size > 5 * 1024 * 1024) {
    status.textContent = "Escolha uma imagem de até 5 MB.";
    return;
  }
  input.disabled = true;
  const data = new FormData();
  data.append("avatar", f);
  try {
    const d = await api("/api/perfil/avatar", "POST", data);
    s.usuario.avatar_url = d.avatar_url;
    sessionStorage.setItem(CONFIG.chaveSessao, JSON.stringify(s));
    status.textContent = "Imagem de perfil salva na conta.";
  } catch (e) {
    status.textContent = e.message;
  } finally {
    input.disabled = false;
  }
};
dashboard()
  .then((d) => {
    const fields = [...document.querySelectorAll(".school-details strong")];
    if (fields[0]) fields[0].textContent = d.sala?.nome || "Sem turma";
    if (fields[1]) fields[1].textContent = d.equipe?.nome || "Sem equipe";
    document
      .querySelectorAll(".school-details p")
      .forEach((e) => (e.textContent = "Dados da sua turma"));
  })
  .catch((e) => (status.textContent = e.message));
