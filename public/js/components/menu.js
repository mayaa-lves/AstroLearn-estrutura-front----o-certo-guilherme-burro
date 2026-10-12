// Ícones SVG locais: não dependem de fontes externas.

const desenhos = {
  home:
    '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',

  conquistas:
    '<path d="M8 3h8v8a4 4 0 0 1-8 0z"/><path d="M8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 15v5m-4 1h8"/>',

  loja:
    '<path d="M4 8h16l-1 13H5zM8 8V6a4 4 0 0 1 8 0v2"/>',

  biblioteca:
    '<path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1z"/>',

  perfil:
    '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',

  equipe:
    '<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m1-17a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 5v2"/>',

  jogos:
    '<path d="M7 7h10c4 0 6 12 3 13-2 1-4-4-5-4H9c-1 0-3 5-5 4C1 19 3 7 7 7zM6 10v5m-2-2h4m8-2h.01m2 3h.01"/>',

  configuracoes:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',

  menu:
    '<path d="M4 6h16M4 12h16M4 18h16"/>',

  mais:
    '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};

function icone(nome) {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' +
    desenhos[nome] +
    '</svg>'
  );
}

// Recolher e expandir o menu.

export function conectarMenu(botao, painel) {
  if (!botao || !painel) return;

  let recolhido = false;

  try {
    recolhido = localStorage.getItem("astrolearn-menu") === "recolhido";
  } catch {}

  function atualizar() {
    painel.classList.toggle("menu--recolhido", recolhido);
    document.body.classList.toggle("menu-collapsed", recolhido);

    botao.setAttribute("aria-expanded", String(!recolhido));
    botao.setAttribute(
      "aria-label",
      recolhido ? "Expandir menu" : "Recolher menu"
    );
  }

  atualizar();

  botao.addEventListener("click", () => {
    recolhido = !recolhido;
    atualizar();

    try {
      localStorage.setItem(
        "astrolearn-menu",
        recolhido ? "recolhido" : "aberto"
      );
    } catch {}
  });
}

// Montar a navegação do aluno.

export function montarMenuAluno(container, paginaAtual = "home") {
  if (!container) return;

  const destinos = [
    ["home", "Início", "home.html"],
    ["conquistas", "Conquistas", "conquistas.html"],
    ["loja", "Loja", "loja.html"],
    ["biblioteca", "Biblioteca", "biblioteca.html"],
    ["perfil", "Perfil", "perfil.html"],
    ["equipe", "Minha equipe", "equipe.html"],
    ["jogos", "Jogos", "jogos/index.html"],
    ["configuracoes", "Configurações", "configuracoes.html"]
  ];

  function link([id, nome, href]) {
    return (
      '<a class="menu-link" href="' + href +
      '" aria-label="' + nome +
      '" title="' + nome + '"' +
      (id === paginaAtual ? ' aria-current="page"' : '') +
      '>' + icone(id) +
      '<span class="menu-text">' + nome + '</span></a>'
    );
  }

  // Apenas textos e endereços fixos deste módulo entram no HTML.
  container.innerHTML =
    '<nav id="menu-aluno" class="app-menu" aria-label="Menu do aluno">' +
      '<div class="menu-heading">' +
        '<a class="menu-brand" href="home.html" aria-label="AstroLearn: início">' +
          icone("home") +
          '<span class="menu-text">AstroLearn</span>' +
        '</a>' +
        '<button id="menu-toggle" class="menu-toggle" type="button" aria-controls="menu-aluno">' +
          icone("menu") +
        '</button>' +
      '</div>' +
      '<div class="menu-links">' +
        destinos.slice(0, 5).map(link).join("") +
        '<button id="menu-mais" class="menu-more" type="button" aria-expanded="false" aria-controls="menu-extras">' +
          icone("mais") +
          '<span>Mais</span>' +
        '</button>' +
        '<div id="menu-extras" class="menu-extras">' +
          destinos.slice(5).map(link).join("") +
        '</div>' +
      '</div>' +
      '<p class="menu-caption">Um universo de descobertas.</p>' +
    '</nav>';

  const painel = container.querySelector("#menu-aluno");
  const mais = container.querySelector("#menu-mais");

  conectarMenu(container.querySelector("#menu-toggle"), painel);

  function fecharMais() {
    painel.classList.remove("menu-mobile-open");
    mais.setAttribute("aria-expanded", "false");
  }

  mais.addEventListener("click", () => {
    const aberto = painel.classList.toggle("menu-mobile-open");
    mais.setAttribute("aria-expanded", String(aberto));
  });

  document.addEventListener("click", event => {
    if (!painel.contains(event.target)) {
      fecharMais();
    }
  });

  painel.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      painel.classList.contains("menu-mobile-open")
    ) {
      fecharMais();
      mais.focus();
    }
  });
}