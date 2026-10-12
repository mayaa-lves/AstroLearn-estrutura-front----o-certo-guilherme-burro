/* Biblioteca inicial: conteúdo autoral introdutório; referências externas identificadas. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const materials = [
    {
      id: "rover",
      title: "Robôs em outros mundos",
      topic: "Robótica",
      format: "Leitura",
      minutes: 5,
      sections: [
        [
          "Explorar sem estar lá",
          "Rovers são veículos robóticos que se deslocam pela superfície de outro mundo. Em Marte, eles ajudam a investigar o terreno e coletar informações usando instrumentos científicos.",
        ],
        [
          "Transformar uma pergunta em dados",
          "Uma câmera registra imagens. Outros instrumentos investigam características de materiais. A escolha do instrumento depende da pergunta: observar uma paisagem exige recursos diferentes de analisar uma rocha.",
        ],
        [
          "Seu desafio",
          "Imagine um robô para explorar um terreno desconhecido. Escolha uma pergunta, um instrumento para investigá-la e uma forma de registrar os resultados.",
        ],
      ],
      question:
        "Se seu robô precisasse comparar duas rochas, apenas uma foto seria suficiente?",
      hint: "Uma imagem mostra aparência. Outras propriedades podem exigir instrumentos diferentes. Pense no que você quer comparar.",
      sources: [
        ["NASA · Exploração de Marte", "https://science.nasa.gov/mars/"],
      ],
    },
    {
      id: "solar",
      title: "Conheça o Sistema Solar",
      topic: "Espaço",
      format: "Leitura",
      minutes: 6,
      sections: [
        [
          "Uma estrela e seus vizinhos",
          "O Sistema Solar inclui o Sol, oito planetas e muitos outros corpos. O Sol é uma estrela; os planetas orbitam ao seu redor.",
        ],
        [
          "Organize sua descoberta",
          "Na ordem a partir do Sol: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno. Os quatro primeiros são planetas rochosos.",
        ],
        [
          "Um modelo que explica",
          "Desenhe um modelo e indique o que ele simplifica. Se as distâncias e os tamanhos não estiverem proporcionais, escreva “fora de escala”. Um modelo é uma representação, não uma cópia perfeita.",
        ],
      ],
      question:
        "Por que os planetas costumam parecer próximos uns dos outros em desenhos escolares?",
      hint: "Representar tamanhos e distâncias na mesma escala pode exigir muito espaço. A indicação “fora de escala” ajuda a interpretar o desenho.",
      sources: [
        [
          "NASA Space Place · Sistema Solar",
          "https://spaceplace.nasa.gov/menu/solar-system/",
        ],
      ],
    },
    {
      id: "experiment",
      title: "Da pergunta ao experimento",
      topic: "Ciência",
      format: "Guia",
      minutes: 6,
      sections: [
        [
          "Comece observando",
          "Escolha algo do cotidiano que desperte curiosidade. Transforme essa observação em uma pergunta que possa ser investigada: a quantidade de luz influencia o crescimento de uma planta?",
        ],
        [
          "Planeje uma comparação",
          "Mude uma condição por vez. Para comparar a luz, mantenha iguais, tanto quanto possível, a espécie, o solo, a quantidade de água e o tempo de observação. Registre também situações inesperadas.",
        ],
        [
          "Registre antes de concluir",
          "Prepare uma tabela com data e medida. Compare os resultados e explique os limites do seu teste. Um resultado diferente da sua hipótese também ensina.",
        ],
      ],
      question:
        "Se você mudar a luz e a quantidade de água ao mesmo tempo, o que ficará difícil de explicar?",
      hint: "Fica difícil distinguir qual mudança influenciou o resultado. Repensar o planejamento faz parte da investigação.",
      sources: [],
    },
    {
      id: "circuit",
      title: "Primeiros passos com circuitos",
      topic: "Robótica",
      format: "Guia",
      minutes: 7,
      sections: [
        [
          "Um caminho para a corrente",
          "Em um circuito simples, os componentes são conectados para formar um caminho. Uma protoboard permite testar conexões sem solda; suas ligações internas precisam ser conhecidas antes da montagem.",
        ],
        [
          "Comece pelo LED da placa",
          "Com a orientação do professor, o exemplo Blink da documentação Arduino permite começar pelo LED integrado de uma placa compatível. Não é necessário montar um LED externo para essa primeira observação.",
        ],
        [
          "Observe e explique",
          "Leia o exemplo oficial e identifique quais instruções acendem, apagam e aguardam. Se a placa e a montagem forem diferentes, confira a documentação correspondente antes de fazer conexões.",
        ],
      ],
      question:
        "O que você espera observar ao aumentar o tempo de espera entre acender e apagar o LED?",
      hint: "O LED permanecerá mais tempo em cada estado. Compare sua previsão com o comportamento observado.",
      sources: [
        [
          "Arduino · Exemplo Blink",
          "https://docs.arduino.cc/built-in-examples/basics/Blink/",
        ],
      ],
    },
    {
      id: "sky",
      title: "Observe o céu",
      topic: "Espaço",
      format: "Atividade prática",
      minutes: 15,
      sections: [
        [
          "Prepare seu registro",
          "Escolha um local adequado com orientação de um adulto. Você pode começar a olho nu. Anote data, horário, local e condições do céu. Não olhe para o Sol, especialmente com instrumentos ópticos.",
        ],
        [
          "Observe e desenhe",
          "Procure a Lua ou pontos luminosos visíveis. Faça um desenho da posição deles em relação ao horizonte e registre suas dúvidas. Não tente identificar um objeto apenas pela cor.",
        ],
        [
          "Volte para comparar",
          "Em outra ocasião, compare um novo registro com o anterior. Consulte materiais de astronomia para investigar o que observou. Céu encoberto também é uma condição a registrar.",
        ],
      ],
      question:
        "Que informações ajudariam outra pessoa a repetir sua observação?",
      hint: "Local, data, horário e condições do céu tornam o registro mais útil para comparar observações.",
      sources: [
        [
          "NASA Space Place · Explore o Sistema Solar",
          "https://spaceplace.nasa.gov/menu/solar-system/",
        ],
      ],
    },
    {
      id: "art",
      title: "Crie sua própria constelação",
      topic: "Arte",
      format: "Atividade prática",
      minutes: 10,
      sections: [
        [
          "Encontre uma forma",
          "Marque pontos em uma folha e imagine figuras que poderiam conectá-los. Use lápis e papel, sem precisar de materiais especiais.",
        ],
        [
          "Conte uma história",
          "Escolha uma figura e crie um nome. Descreva como sua história se relaciona com os pontos. Identifique seu desenho como uma constelação inventada para esta atividade.",
        ],
        [
          "Compartilhe seu processo",
          "Explique quais escolhas fez. Duas pessoas podem imaginar figuras diferentes a partir dos mesmos pontos. Compare essas interpretações sem precisar escolher uma “vencedora”.",
        ],
      ],
      question:
        "Seu colega consegue enxergar outra figura usando os mesmos pontos?",
      hint: "Mude algumas conexões e compare os resultados. A imaginação pode produzir leituras diferentes de uma mesma composição.",
      sources: [],
    },
  ];
  const key = "astrolearn-library-v1";
  let state = { favorites: [], read: [], last: null },
    storageOK = true;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    if (raw && typeof raw === "object") {
      const valid = (x) =>
        Array.isArray(x)
          ? x.filter((v) => materials.some((m) => m.id === v))
          : [];
      state = {
        favorites: valid(raw.favorites),
        read: valid(raw.read),
        last: materials.some((m) => m.id === raw.last) ? raw.last : null,
      };
    }
  } catch {
    storageOK = false;
  }
  let topic = "Todos",
    favoritesOnly = false,
    current = null,
    opener = null;
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      storageOK = true;
      $("storageNotice").textContent = "";
    } catch {
      storageOK = false;
      $("storageNotice").textContent =
        "Não foi possível salvar neste navegador. Suas escolhas continuam disponíveis enquanto esta página estiver aberta.";
    }
  }
  function normalize(s) {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  function toggleFavorite(id) {
    state.favorites = state.favorites.includes(id)
      ? state.favorites.filter((x) => x !== id)
      : [...state.favorites, id];
    persist();
    render();
    if (current) updateReader();
  }
  function render() {
    const grid = $("materials");
    grid.replaceChildren();
    const query = normalize($("search").value);
    let count = 0;
    materials.forEach((m, i) => {
      if (
        (topic !== "Todos" && m.topic !== topic) ||
        (favoritesOnly && !state.favorites.includes(m.id)) ||
        (query &&
          !normalize(
            m.title +
              " " +
              m.topic +
              " " +
              m.format +
              " " +
              m.sections.map((x) => x.join(" ")).join(" "),
          ).includes(query))
      )
        return;
      count++;
      const card = document.createElement("article");
      card.className = "material";
      const favorite = state.favorites.includes(m.id);
      card.innerHTML = `<div class="thumb thumb-${i}" aria-hidden="true"></div><button class="bookmark" aria-label="${favorite ? "Remover" : "Salvar"} ${m.title} ${favorite ? "dos" : "nos"} favoritos" aria-pressed="${favorite}"><svg viewBox="0 0 20 24" aria-hidden="true"><path d="M4 2h12v20l-6-4-6 4Z"/></svg></button><h3>${m.title}</h3><p class="meta">${m.format} · ${m.minutes} min estimados</p><div class="material-footer"><span class="tag">${m.topic}</span><button class="open-material" aria-label="Explorar ${m.title}">Explorar →</button></div>${state.read.includes(m.id) ? '<p class="read-status">✓ Marcado como lido</p>' : ""}`;
      card.querySelector(".bookmark").onclick = () => {
        toggleFavorite(m.id);
        const restored = [...$("materials").querySelectorAll(".bookmark")].find(
          (b) => b.getAttribute("aria-label").includes(m.title),
        );
        if (restored) restored.focus();
        else $("favorites").focus();
      };
      card.querySelector(".open-material").onclick = (e) =>
        openMaterial(m.id, e.currentTarget);
      grid.append(card);
    });
    $("resultCount").textContent =
      `${count} ${count === 1 ? "material encontrado" : "materiais encontrados"}`;
    $("empty").hidden = count > 0;
    $("emptyTitle").textContent =
      favoritesOnly && !query
        ? "Sua coleção está começando"
        : "Nenhum material encontrado";
    $("emptyText").textContent =
      favoritesOnly && !query
        ? "Use o marcador nos cards para guardar materiais por aqui."
        : "Tente outro termo ou remova os filtros para explorar a biblioteca.";
    $("favoriteCount").textContent = state.favorites.length;
    $("clearSearch").hidden = !$("search").value;
    const last =
      materials.find((m) => m.id === state.last) ||
      materials.find((m) => m.id === "solar");
    $("continuePanel").hidden = false;
    const banner = $("continuePanel");
    banner.querySelector(".eyebrow").textContent = state.last
      ? "CONTINUE EXPLORANDO"
      : "LEITURA EM DESTAQUE";
    banner.querySelector("p").textContent = state.last
      ? "Retome o material que você abriu por último."
      : "Comece com uma descoberta sobre o Sistema Solar.";
    $("continueReading").textContent = state.last
      ? "Continuar leitura →"
      : "Explorar material →";
    if (last) {
      $("continueTitle").textContent = last.title;
      $("continueThumb").className = "thumb thumb-" + materials.indexOf(last);
    }
  }
  function updateReader() {
    if (!current) return;
    const favorite = state.favorites.includes(current.id),
      read = state.read.includes(current.id);
    $("saveInReader").setAttribute("aria-pressed", String(favorite));
    $("saveInReader").textContent = favorite
      ? "Remover dos favoritos"
      : "Salvar nos favoritos";
    $("markRead").textContent = read
      ? "Desmarcar como lido"
      : "Marcar como lido";
    $("readingStatus").textContent = read
      ? "Marcado como lido neste navegador."
      : "";
  }
  function openMaterial(id, trigger) {
    current = materials.find((m) => m.id === id);
    if (!current) return;
    opener = trigger || document.activeElement;
    state.last = id;
    persist();
    render();
    $("readerTitle").textContent = current.title;
    $("readerMeta").textContent =
      `${current.topic} · ${current.format} · ${current.minutes} min estimados`;
    $("readerContent").replaceChildren();
    current.sections.forEach(([title, body]) => {
      const h = document.createElement("h3"),
        p = document.createElement("p");
      h.textContent = title;
      p.textContent = body;
      $("readerContent").append(h, p);
    });
    $("question").textContent = current.question;
    $("hint").textContent = current.hint;
    $("reader").querySelector("details").open = false;
    $("sources").replaceChildren();
    if (current.sources.length) {
      const div = document.createElement("div");
      div.className = "source-links";
      div.textContent = "Para aprofundar em fontes oficiais:";
      current.sources.forEach(([label, url]) => {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = label + " ↗";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        div.append(a);
      });
      const note = document.createElement("small");
      note.textContent =
        "Os sites externos podem estar em inglês. A leitura introdutória acima está em português.";
      div.append(note);
      $("sources").append(div);
    }
    updateReader();
    $("reader").showModal();
    $("reader").scrollTop = 0;
  }
  $("search").oninput = render;
  $("clearSearch").onclick = () => {
    $("search").value = "";
    render();
    $("search").focus();
  };
  document.querySelectorAll("[data-topic]").forEach(
    (b) =>
      (b.onclick = () => {
        topic = b.dataset.topic;
        document
          .querySelectorAll("[data-topic]")
          .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        render();
      }),
  );
  $("favorites").onclick = () => {
    favoritesOnly = !favoritesOnly;
    $("favorites").setAttribute("aria-pressed", String(favoritesOnly));
    render();
  };
  $("reset").onclick = () => {
    topic = "Todos";
    favoritesOnly = false;
    $("search").value = "";
    $("favorites").setAttribute("aria-pressed", "false");
    document
      .querySelectorAll("[data-topic]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.topic === "Todos")),
      );
    render();
    $("search").focus();
  };
  $("continueReading").onclick = () =>
    openMaterial(state.last || "solar", $("continueReading"));
  $("saveInReader").onclick = () => toggleFavorite(current.id);
  $("markRead").onclick = () => {
    state.read = state.read.includes(current.id)
      ? state.read.filter((x) => x !== current.id)
      : [...state.read, current.id];
    persist();
    updateReader();
    render();
  };
  $("download").onclick = () => {
    if (!current) return;
    const text =
      current.title +
      "\nAstroLearn · Roteiro introdutório\n\n" +
      current.sections.map(([h, p]) => h + "\n" + p).join("\n\n") +
      "\n\nPARA PENSAR\n" +
      current.question +
      "\n\nREFERÊNCIAS\n" +
      current.sources.map((x) => x.join(": ")).join("\n");
    const url = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "astrolearn-" + current.id + ".txt";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document
    .querySelectorAll("[data-close]")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((d) =>
    d.addEventListener("close", () => {
      if (opener?.isConnected) opener.focus();
      else {
        const target =
          current &&
          [...$("materials").querySelectorAll(".open-material")].find(
            (b) => b.getAttribute("aria-label") === "Explorar " + current.title,
          );
        if (target) target.focus();
        else $("search").focus();
      }
    }),
  );
  document.querySelectorAll("[data-soon]").forEach(
    (b) =>
      (b.onclick = () => {
        opener = b;
        $("infoTitle").textContent = b.dataset.soon;
        $("infoText").textContent =
          "Esta área será uma das próximas etapas. Você já pode explorar a biblioteca, a trilha e as conquistas.";
        $("info").showModal();
      }),
  );
  $("helper").onclick = () => {
    opener = $("helper");
    $("infoTitle").textContent = "Uma pista para explorar";
    $("infoText").textContent =
      "Busque por palavras, escolha um assunto e salve materiais nos favoritos. Clique em Explorar para ler o roteiro, abrir uma pista ou baixar o texto. Seu histórico fica apenas neste navegador.";
    $("info").showModal();
  };
  if (!storageOK)
    $("storageNotice").textContent =
      "O armazenamento não está disponível. Suas escolhas valem para esta visita.";
  render();
})();
