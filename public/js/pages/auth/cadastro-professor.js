// Cadastro visual fiel à referência. Valida os campos, mas não cria uma conta.
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
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const [senha, confirmar] = senhas;
  const checks = [
    [nome, nome.value.trim() ? "" : "Informe seu nome."],
    [
      email,
      email.value.trim() && email.validity.valid
        ? ""
        : "Informe um e-mail válido.",
    ],
    [senha, senha.value.length >= 8 ? "" : "Use pelo menos 8 caracteres."],
    [
      confirmar,
      confirmar.value && confirmar.value === senha.value
        ? ""
        : "As duas senhas precisam ser iguais.",
    ],
  ];
  const escola = document.getElementById("escola");
  const chave = document.getElementById("chave");
  if (escola)
    checks.splice(2, 0, [
      escola,
      escola.value.trim() ? "" : "Informe sua escola.",
    ]);
  if (chave)
    checks.push([
      chave,
      chave.value.trim() ? "" : "Informe a chave fornecida pela coordenação.",
    ]);
  let first = null;
  checks.forEach(([campo, mensagem]) => {
    if (!erro(campo, mensagem) && !first) first = campo;
  });
  if (first) {
    if (first.id === "chave")
      document.getElementById("autorizacao").open = true;
    status.textContent = "Confira os campos destacados.";
    first.focus();
    return;
  }
  status.textContent =
    "Campos validados nesta prévia. Nenhuma conta foi criada nem chave verificada pelo servidor.";
});
form.addEventListener("input", (event) => {
  if (document.getElementById(event.target.id + "-erro"))
    erro(event.target, "");
  status.textContent = "";
});
// Cobre os olhos na senha, confirmação e chave de autorização.

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

// Botões de mostrar e ocultar os campos privados.

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
        (campo.id === "chave"
          ? "chave de autorização"
          : campo.id === "confirmar"
            ? "confirmação da senha"
            : "senha"),
    );

    campo.focus();
  });
});

// Movimento pequeno e conjunto dos olhos.

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

// Mensagens ao clicar na mascote.

const dicas = [
  "Boas-vindas! Aqui começa seu acesso de professor.",
  "Sem a chave de autorização? Peça à coordenação antes de concluir o cadastro.",
  "Uma boa pergunta pode ser o começo de uma grande descoberta.",
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

// Controle de movimento.

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
