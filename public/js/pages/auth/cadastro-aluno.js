// Cadastro visual fiel à referência. Valida os campos, mas não cria uma conta.
import { conectarCadastro } from '../../components/cadastro-api.js';


const form = document.querySelector("#cadastro-form");
const pagina = document.body;
const status = document.querySelector("#cadastro-status");
const senhas = [
  document.querySelector("#senha"),
  document.querySelector("#confirmar"),
];
const camposPrivados = [...senhas, document.querySelector("#chave")].filter(
  Boolean,
);
const preferencia = matchMedia("(prefers-reduced-motion: reduce)");
const movimento = document.querySelector("#movimento");
let pausado = preferencia.matches,
  avisoTimer,
  quadro;
function erro(campo, mensagem) {
  const aviso = document.getElementById(campo.id + "-erro");
  campo.setAttribute("aria-invalid", String(Boolean(mensagem)));
  aviso.textContent = mensagem;
  aviso.hidden = !mensagem;
  return !mensagem;
}

conectarCadastro({ form, status, senhas, erro });

// Cobre os olhos nos dois campos, mesmo com senha revelada.

function atualizarPrivacidade() {
  pagina.classList.toggle(
    "senha-ativa",
    camposPrivados.includes(document.activeElement),
  );
}

camposPrivados.forEach((campo) => {
  campo.addEventListener("focus", atualizarPrivacidade);

  campo.addEventListener("blur", () => {
    queueMicrotask(atualizarPrivacidade);
  });
});

document.querySelectorAll("[data-senha]").forEach((botao) => {
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.dataset.senha);
    const mostrar = campo.type === "password";

    campo.type = mostrar ? "text" : "password";
    botao.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>${mostrar ? '<path d="m3 3 18 18"/>' : ""}</svg>`;
    botao.setAttribute("aria-pressed", String(mostrar));

    botao.setAttribute(
      "aria-label",
      (mostrar ? "Ocultar " : "Mostrar ") +
        (campo.id === "confirmar" ? "confirmação da senha" : "senha"),
    );

    campo.focus();
  });
});

// Movimento conjunto e discreto dos olhos.

const olhos = [...document.querySelectorAll(".olho")];
const canvas = document.querySelector(".cenario-canvas");

function centralizarOlhos() {
  olhos.forEach((olho) => {
    olho.style.translate = "0px 0px";
  });
}

document.addEventListener("pointermove", (event) => {
  if (pausado || event.pointerType === "touch" || innerWidth <= 800) {
    return;
  }

  if (quadro) {
    cancelAnimationFrame(quadro);
  }

  const x = event.clientX;
  const y = event.clientY;

  quadro = requestAnimationFrame(() => {
    const rect = canvas.getBoundingClientRect();

    const dx = x - (rect.left + rect.width * 0.279);
    const dy = y - (rect.top + rect.height * 0.51);

    const distancia = Math.max(Math.hypot(dx, dy), 1);
    const limite = rect.width * 0.0018;
    const intensidade = Math.min(distancia / 180, 1);

    olhos.forEach((olho) => {
      olho.style.translate =
        (dx / distancia) * limite * intensidade +
        "px " +
        (dy / distancia) * limite * intensidade +
        "px";
    });

    quadro = null;
  });
});

document.documentElement.addEventListener("pointerleave", centralizarOlhos);

// Mensagens ao clicar na turquesa.

const dicas = [
  "Oi! Vamos explorar juntos? Comece preenchendo seu nome.",
  "Aqui a curiosidade é bem-vinda. Aprender também é fazer perguntas!",
  "Um ano em Vênus é mais curto que uma volta completa do planeta sobre seu eixo.",
];

let proximaDica = 0;

document.querySelector(".mascote").addEventListener("click", () => {
  const dica = document.querySelector("#dica-mascote");

  dica.textContent = dicas[proximaDica++ % dicas.length];
  dica.hidden = false;

  clearTimeout(avisoTimer);

  avisoTimer = setTimeout(() => {
    dica.hidden = true;
  }, 6000);
});

// Controle das animações.

function atualizarMovimento() {
  pagina.classList.toggle("sem-movimento", pausado);

  movimento.textContent = pausado ? "Ativar animações" : "Pausar animações";

  movimento.setAttribute("aria-pressed", String(pausado));

  if (pausado) {
    if (quadro) {
      cancelAnimationFrame(quadro);
    }

    quadro = null;
    centralizarOlhos();
  }
}

movimento.addEventListener("click", () => {
  pausado = !pausado;
  atualizarMovimento();
});

preferencia.addEventListener("change", (event) => {
  pausado = event.matches;
  atualizarMovimento();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (quadro) {
      cancelAnimationFrame(quadro);
    }

    quadro = null;
    centralizarOlhos();
  }
});

atualizarMovimento();
