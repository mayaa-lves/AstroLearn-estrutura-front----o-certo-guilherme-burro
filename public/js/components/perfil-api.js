import {
  sessaoObrigatoria,
  api
} from "../services/conexao.js";

import { dashboard } from "../services/aluno.js";
import { CONFIG } from "../config.js";

const session = sessaoObrigatoria("aluno");
const $ = id => document.getElementById(id);
const user = session.usuario;

const allowed = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];

$("studentName").textContent = user.nome || "Aluno";

$("studentEmail").textContent =
  user.email || "E-mail não informado na sessão";

$("avatarInitials").textContent = (user.nome || "Aluno")
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0])
  .join("")
  .toLocaleUpperCase("pt-BR");

function imageURL(raw) {
  try {
    const url = new URL(raw);

    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function showAvatar(raw) {
  const url = imageURL(raw);
  const img = $("avatarImage");

  img.hidden = true;

  if (!url) {
    img.removeAttribute("src");
    return;
  }

  img.onload = () => {
    img.hidden = false;
  };

  img.onerror = () => {
    img.hidden = true;
  };

  img.src = url;
}

showAvatar(user.avatar_url);

$("changePhoto").addEventListener("click", () => {
  $("avatarFile").click();
});

$("avatarFile").addEventListener("change", async () => {
  const input = $("avatarFile");
  const file = input.files?.[0];

  if (!file) return;

  if (
    !allowed.includes(file.type) ||
    !/\.(png|jpe?g|webp|gif)$/i.test(file.name)
  ) {
    $("avatarStatus").textContent =
      "Use uma imagem PNG, JPG, WebP ou GIF.";

    input.value = "";
    return;
  }

  if (!file.size || file.size > 5 * 1024 * 1024) {
    $("avatarStatus").textContent =
      "Escolha uma imagem de até 5 MB que não esteja vazia.";

    input.value = "";
    return;
  }

  input.disabled = true;
  $("changePhoto").disabled = true;
  $("avatarStatus").textContent = "Enviando foto…";

  const data = new FormData();
  data.append("avatar", file);

  try {
    const result = await api(
      "/api/perfil/avatar",
      "POST",
      data
    );

    const url = imageURL(result?.avatar_url);

    if (!url) {
      throw new Error(
        "O servidor não retornou uma URL válida para a foto. " +
        "Atualize a página para conferir o envio."
      );
    }

    user.avatar_url = url;
    showAvatar(url);

    try {
      const current = JSON.parse(
        sessionStorage.getItem(CONFIG.chaveSessao) || "null"
      );

      if (
        current?.usuario?.id !== user.id ||
        current?.token !== session.token
      ) {
        throw new Error("Sessão alterada");
      }

      current.usuario.avatar_url = url;

      sessionStorage.setItem(
        CONFIG.chaveSessao,
        JSON.stringify(current)
      );

      $("avatarStatus").textContent =
        "Foto salva na sua conta.";
    } catch {
      $("avatarStatus").textContent =
        "Foto salva na conta, mas não foi possível atualizar " +
        "a sessão deste navegador. Faça login novamente se " +
        "a foto antiga continuar aparecendo.";
    }
  } catch (error) {
    $("avatarStatus").textContent =
      error.message ||
      "Não foi possível enviar a foto. Tente novamente.";
  } finally {
    input.disabled = false;
    input.value = "";
    $("changePhoto").disabled = false;
  }
});

async function loadSchool() {
  $("retrySchool").disabled = true;
  $("retrySchool").hidden = true;
  $("schoolError").textContent = "";

  $("roomName").textContent = "Carregando…";
  $("teamName").textContent = "Carregando…";

  try {
    const data = await dashboard();

    $("roomName").textContent =
      data.sala?.nome || "Sem turma";

    $("teamName").textContent =
      data.equipe?.nome || "Não vinculada";
  } catch (error) {
    $("roomName").textContent = "Não disponível";
    $("teamName").textContent = "Não disponível";

    $("schoolError").textContent =
      error.message ||
      "Não foi possível consultar sua turma.";

    $("retrySchool").hidden = false;
  } finally {
    $("retrySchool").disabled = false;
  }
}

$("retrySchool").addEventListener("click", loadSchool);

loadSchool();