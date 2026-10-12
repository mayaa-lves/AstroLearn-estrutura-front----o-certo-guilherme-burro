import { conectarUpload, tamanhoLegivel } from "../../components/upload.js";

// Dados de exemplo: não consulta nem altera a API.

const params = new URLSearchParams(location.search);
const mission = Number(params.get("missao") ?? 1);
const titles = ["Primeiro contato", "Órbita das ideias", "Laboratório lunar"];
document.querySelector("#atividade-titulo").textContent =
  titles[mission] || titles[1];
if (mission === 0) {
  document.querySelector("#atividade-resumo").textContent =
    "Todo explorador começa observando.";
  document.querySelector("#atividade-objetivo").textContent =
    "Registre uma observação que despertou sua curiosidade e explique o que você gostaria de investigar.";
}
if (mission === 2) {
  document.querySelector("#atividade-resumo").textContent =
    "Uma hipótese, um teste, uma nova descoberta.";
  document.querySelector("#atividade-objetivo").textContent =
    "Planeje um experimento e explique o que mudar, medir e manter igual.";
}
if (params.get("equipe") === "lunar") {
  document.querySelector("#atividade-titulo").textContent =
    "Construam um explorador lunar";
  document.querySelector("#atividade-resumo").textContent =
    "Ideias compartilhadas e um plano de exploração.";
  document.querySelector("#atividade-objetivo").textContent =
    "Planejem um robô explorador e registrem a contribuição de cada integrante.";
  document.querySelector("#missionType").textContent = "Em equipe · exemplo";
  const steps = [
    "Investiguem um desafio do terreno lunar.",
    "Desenhem o protótipo e justifiquem as partes escolhidas.",
    "Planejem uma comparação para testar a proposta.",
    "Registrem as decisões e a contribuição de cada integrante.",
  ];
  document.querySelector("#atividade-passos").replaceChildren(
    ...steps.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
}
document.title =
  document.querySelector("#atividade-titulo").textContent + " · AstroLearn";

// Conectar a seleção dos anexos.

const entregaStatus = document.querySelector("#entrega-status");
const resposta = document.querySelector("#resposta");

const upload = conectarUpload({
  input: document.querySelector("#arquivos"),
  botao: document.querySelector("#adicionar-arquivos"),
  dropzone: document.querySelector("#anexos-dropzone"),
  lista: document.querySelector("#anexos-lista"),
  status: document.querySelector("#anexos-status"),
  contador: document.querySelector("#anexos-contador"),

  onChange: () => {
    entregaStatus.textContent = "";
  },
});

// Revisão antes da confirmação: a ponte de demonstração salva apenas localmente.

const revisao = document.querySelector("#revisao-dialog");

document.querySelector("#entrega-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const texto = resposta.value.trim();
  const arquivos = upload.getFiles();

  if (!texto && !arquivos.length) {
    entregaStatus.textContent =
      "Escreva uma resposta ou adicione pelo menos um arquivo para revisar.";

    entregaStatus.dataset.error = "true";
    resposta.setAttribute("aria-invalid", "true");
    resposta.focus();
    return;
  }

  resposta.removeAttribute("aria-invalid");
  entregaStatus.dataset.error = "false";
  entregaStatus.textContent = "";

  document.querySelector("#revisao-resposta").textContent =
    texto || "Sem resposta em texto; trabalho anexado.";

  const lista = document.querySelector("#revisao-arquivos");
  lista.replaceChildren();

  if (!arquivos.length) {
    const li = document.createElement("li");
    li.textContent = "Sem anexos; resposta em texto.";
    lista.append(li);
  }

  arquivos.forEach((file) => {
    const li = document.createElement("li");

    li.textContent = file.name + " · " + tamanhoLegivel(file.size);

    lista.append(li);
  });

  document.querySelector("#demoSubmissionStatus").textContent = "";
  revisao.showModal();
});

resposta.addEventListener("input", () => {
  entregaStatus.textContent = "";
  resposta.removeAttribute("aria-invalid");
});

// A ponte de demonstração inicializa perguntas, materiais e entregas locais.
import { iniciarAtividadeDemo } from "../../components/atividade-demo.js";
iniciarAtividadeDemo({ upload, resposta, entregaStatus, revisao });

// Material e diálogos.

const material = document.querySelector("#material-dialog");

document
  .querySelector("#material-roteiro")
  .addEventListener("click", () => material.showModal());

[material, revisao].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();

    const fora =
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom;

    if (event.target === dialog && fora) {
      dialog.close();
    }
  });
});

// Fechar os diálogos da referência e devolver o foco ao botão de origem.
let origem = null;
document
  .querySelector("#material-roteiro")
  .addEventListener("click", (event) => {
    origem = event.currentTarget;
  });
document
  .querySelectorAll("[data-close]")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
[material, revisao].forEach((dialog) =>
  dialog.addEventListener("close", () => {
    const destino =
      dialog === revisao ? document.querySelector("#submitDelivery") : origem;
    destino?.focus();
  }),
);
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) upload.destroy();
});
