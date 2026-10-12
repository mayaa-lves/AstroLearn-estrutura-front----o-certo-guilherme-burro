/* Escolhas locais: nenhuma informação de conta, nota ou pagamento é criada aqui. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    KEY = "astrolearn-avatar-v1";
  const characters = [
    { id: "explorador", name: "Explorador" },
    { id: "turquesa", name: "Turquesa" },
    { id: "lilas", name: "Lilás" },
    { id: "tres-olhos", name: "Três Olhos" },
  ];
  const pieces = {
    top: [
      { id: "top-orion", name: "Jaqueta Órion", row: 1, price: 0 },
      { id: "top-galaxia", name: "Jaqueta Galáxia", row: 2, price: 100 },
    ],
    legs: [
      { id: "legs-orion", name: "Calça Órion", row: 1, price: 0 },
      { id: "legs-galaxia", name: "Calça Galáxia", row: 2, price: 80 },
    ],
    hat: [{ id: "hat-cometa", name: "Boné Cometa", row: 2, price: 80 }],
  };
  const allPieces = Object.values(pieces).flat(),
    free = ["top-orion", "legs-orion"];
  const blank = () => ({ character: null, top: null, legs: null, hat: null });
  function validLook(v) {
    if (!v || typeof v !== "object") return blank();
    const out = blank();
    if (characters.some((c) => c.id === v.character))
      out.character = v.character;
    for (const k of ["top", "legs", "hat"])
      if (pieces[k].some((p) => p.id === v[k])) out[k] = v[k];
    if (!out.character) return blank();
    return out;
  }
  let account = { coins: 320, owned: [...free], saved: blank() },
    storageIssue = false;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.version === 1) {
      account.coins =
        Number.isInteger(raw.coins) && raw.coins >= 0 && raw.coins <= 320
          ? raw.coins
          : 320;
      account.owned = [
        ...new Set([
          ...free,
          ...(Array.isArray(raw.owned) ? raw.owned : []).filter((id) =>
            allPieces.some((p) => p.id === id),
          ),
        ]),
      ];
      account.saved = validLook(raw.saved);
      for (const k of ["top", "legs", "hat"])
        if (account.saved[k] && !account.owned.includes(account.saved[k]))
          account.saved[k] = null;
    }
  } catch (e) {
    storageIssue = true;
  }
  let draft = { ...account.saved },
    category = "top",
    view = "front",
    past = [],
    future = [],
    pending = null,
    dialogOrigin = null;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b),
    copy = (v) => ({ ...v });
  function persist(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, ...next }));
      return true;
    } catch (e) {
      $("error").textContent =
        "Não foi possível salvar neste navegador. Seu saldo e o último visual salvo foram mantidos. Libere espaço ou permita o armazenamento do site e tente novamente.";
      return false;
    }
  }
  function say(text) {
    $("status").textContent = text;
  }
  function change(patch) {
    const next = { ...draft, ...patch };
    if (equal(next, draft)) return;
    past.push(copy(draft));
    if (past.length > 40) past.shift();
    future = [];
    draft = next;
    $("error").textContent = "";
    render();
  }
  function item(id) {
    return allPieces.find((p) => p.id === id);
  }
  /* Duas vistas renderizadas; troca de camadas sem simular rotação 360°. */
  function frame(el, char, row = 0, side = "front") {
    el.style.backgroundImage = `url('../public/assets/imagens/aluno/loja/${char}.png')`;
    el.style.backgroundPosition = `${side === "back" ? "100%" : "0%"} ${row * 50}%`;
    el.dataset.character = char;
    el.dataset.side = side;
    el.dataset.row = String(row);
  }
  function makeFrame(char, row = 0) {
    const el = document.createElement("span");
    el.className = "frame";
    frame(el, char, row);
    return el;
  }
  function renderCharacters() {
    const list = $("characters");
    list.replaceChildren();
    for (const c of characters) {
      const b = document.createElement("button");
      b.className = "character";
      b.dataset.character = c.id;
      b.setAttribute("aria-label", `Escolher personagem ${c.name}`);
      b.setAttribute("aria-pressed", String(draft.character === c.id));
      const art = document.createElement("span");
      art.className = "character-art";
      art.setAttribute("aria-hidden", "true");
      art.append(makeFrame(c.id));
      const title = document.createElement("strong");
      title.textContent = c.name;
      b.append(art, title);
      b.addEventListener("click", () => {
        change({ character: c.id });
        say(
          `${c.name} escolhido. As roupas acompanham o formato deste personagem.`,
        );
      });
      list.append(b);
    }
  }
  function renderCatalogue() {
    const list = $("catalogue");
    list.replaceChildren();
    $("catalogue").setAttribute("aria-labelledby", "tab-" + category);
    for (const p of pieces[category]) {
      const b = document.createElement("button");
      b.className = "item " + category;
      b.dataset.item = p.id;
      b.disabled = !draft.character;
      b.setAttribute("aria-pressed", String(draft[category] === p.id));
      const own = account.owned.includes(p.id);
      b.setAttribute(
        "aria-label",
        `${p.name}. ${own ? "Disponível no seu inventário" : p.price + " astromoedas. Clique para experimentar"}`,
      );
      const art = document.createElement("span");
      art.className = "item-art";
      art.setAttribute("aria-hidden", "true");
      art.append(makeFrame(draft.character || "explorador", p.row));
      const title = document.createElement("strong");
      title.textContent = p.name;
      const meta = document.createElement("small");
      meta.textContent = own ? "✓ Você já tem" : `✦ ${p.price} · Experimentar`;
      b.append(art, title, meta);
      b.addEventListener("click", () => {
        change({ [category]: p.id });
        say(
          `${p.name} em prévia.${own ? "" : " Você pode experimentar antes de resgatar."}`,
        );
      });
      list.append(b);
    }
    if (category === "hat") {
      const b = document.createElement("button");
      b.className = "item hat";
      b.disabled = !draft.character;
      b.setAttribute("aria-pressed", String(!draft.hat));
      b.setAttribute("aria-label", "Sem acessório");
      const symbol = document.createElement("span");
      symbol.className = "no-item";
      symbol.textContent = "◌";
      symbol.setAttribute("aria-hidden", "true");
      const title = document.createElement("strong");
      title.textContent = "Sem acessório";
      b.append(symbol, title);
      b.addEventListener("click", () => change({ hat: null }));
      list.prepend(b);
    }
  }
  function render() {
    const active = document.activeElement;
    const focusId = active?.dataset?.character;
    const focusItem = active?.dataset?.item;
    renderCharacters();
    renderCatalogue();
    $("balance").textContent = account.coins;
    $("avatar").hidden = !draft.character;
    $("stageEmpty").hidden = !!draft.character;
    $("front").disabled = $("back").disabled = !draft.character;
    $("clearPart").disabled = !draft.character || !draft[category];
    $("undo").disabled = !past.length;
    $("redo").disabled = !future.length;
    let count = (draft.top ? 1 : 0) + (draft.legs ? 1 : 0);
    $("completion").textContent = count + " / 2 peças";
    $("stepCharacter").className = draft.character ? "done" : "current";
    $("stepClothes").className = draft.character
      ? count === 2
        ? "done"
        : "current"
      : "";
    $("stepAccessories").className = count === 2 ? "current" : "";
    $("save").disabled = !draft.character || count !== 2;
    const unpaid = ["top", "legs", "hat"]
      .map((k) => item(draft[k]))
      .filter((p) => p && !account.owned.includes(p.id));
    $("save").textContent = unpaid.length
      ? "Resgatar e salvar"
      : "Salvar visual";
    const c = characters.find((c) => c.id === draft.character);
    $("characterName").textContent = c ? c.name : "Escolha um mascote";
    $("wardrobeTitle").textContent = c
      ? `Vista seu ${c.name.toLowerCase()}`
      : "Agora, vista seu explorador";
    $("partHint").textContent = !c
      ? "Escolha um personagem acima para liberar as peças."
      : category === "hat"
        ? "O boné já traz uma sombra suave sobre o rosto. Acessório é opcional."
        : "Selecione uma peça. O corpo neutro aparece até você escolher a roupa.";
    $("previewHint").textContent = !c
      ? "Selecione um personagem para começar."
      : unpaid.length
        ? `Experimentando ${unpaid.length} peça(s) ainda não resgatada(s). Total: ${unpaid.reduce((s, p) => s + p.price, 0)} astromoedas.`
        : count < 2
          ? "Escolha o tronco e as pernas. Acessórios são opcionais."
          : "Seu visual está pronto para salvar.";
    for (const tab of document.querySelectorAll("[data-category]")) {
      const on = tab.dataset.category === category;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    }
    $("front").setAttribute("aria-pressed", String(view === "front"));
    $("back").setAttribute("aria-pressed", String(view === "back"));
    if (c) {
      frame($("baseFrame"), c.id, draft.hat ? 2 : 0, view);
      frame($("topFrame"), c.id, item(draft.top)?.row || 0, view);
      frame($("legsFrame"), c.id, item(draft.legs)?.row || 0, view);
      $("hatFrame").hidden = true;
      $("avatar").setAttribute(
        "aria-label",
        `${c.name}, vista ${view === "front" ? "de frente" : "de costas"}. ${draft.top ? item(draft.top).name : "Tronco neutro"}, ${draft.legs ? item(draft.legs).name : "Pernas neutras"}${draft.hat ? ", " + item(draft.hat).name : ""}.`,
      );
    }
    if (focusId)
      $("characters").querySelector(`[data-character="${focusId}"]`)?.focus();
    if (focusItem)
      $("catalogue").querySelector(`[data-item="${focusItem}"]`)?.focus();
  }
  function openDialog(id) {
    dialogOrigin = document.activeElement;
    $(id).showModal();
  }
  function closeDialog(d) {
    d.close();
    if (dialogOrigin?.isConnected) dialogOrigin.focus();
  }
  for (const b of document.querySelectorAll("[data-close]"))
    b.addEventListener("click", () => closeDialog(b.closest("dialog")));
  for (const d of document.querySelectorAll("dialog"))
    d.addEventListener("cancel", () => {
      if (dialogOrigin?.isConnected) dialogOrigin.focus();
    });
  function info(title, text) {
    $("infoTitle").textContent = title;
    $("infoText").textContent = text;
    openDialog("info");
  }
  function save() {
    if (!draft.character || !draft.top || !draft.legs) return;
    const ids = [
      ...new Set(
        ["top", "legs", "hat"]
          .map((k) => draft[k])
          .filter((id) => id && !account.owned.includes(id)),
      ),
    ];
    if (ids.length) {
      const cost = ids.reduce((s, id) => s + item(id).price, 0);
      pending = { ids, cost, look: copy(draft) };
      $("redeemText").textContent =
        `${ids.map((id) => item(id).name).join(" + ")}: ${cost} astromoedas. Seu saldo passará de ${account.coins} para ${Math.max(0, account.coins - cost)}.`;
      $("redeemError").textContent =
        cost > account.coins
          ? "Saldo de exemplo insuficiente. Escolha peças que você já tem ou uma combinação mais barata."
          : "";
      $("confirmRedeem").disabled = cost > account.coins;
      openDialog("redeemDialog");
      return;
    }
    const next = { ...account, saved: copy(draft) };
    if (persist(next)) {
      account = next;
      say("Visual salvo neste navegador!");
      $("error").textContent = "";
      render();
    }
  }
  $("save").addEventListener("click", save);
  $("confirmRedeem").addEventListener("click", () => {
    if (!pending || !equal(pending.look, draft)) return;
    const remaining = pending.ids.filter((id) => !account.owned.includes(id)),
      cost = remaining.reduce((s, id) => s + item(id).price, 0);
    if (cost > account.coins) return;
    const next = {
      coins: account.coins - cost,
      owned: [...new Set([...account.owned, ...remaining])],
      saved: copy(draft),
    };
    if (!persist(next)) {
      $("redeemError").textContent =
        "O armazenamento falhou. Nenhuma astromoeda foi descontada.";
      return;
    }
    account = next;
    pending = null;
    closeDialog($("redeemDialog"));
    say("Peças resgatadas e visual salvo neste navegador.");
    $("error").textContent = "";
    render();
  });
  $("cancel").addEventListener("click", () => {
    if (equal(draft, account.saved)) {
      say("Seu visual salvo foi mantido.");
      return;
    }
    openDialog("cancelDialog");
  });
  $("confirmCancel").addEventListener("click", () => {
    draft = copy(account.saved);
    past = [];
    future = [];
    pending = null;
    closeDialog($("cancelDialog"));
    render();
    say("Mudanças descartadas. Seu último visual salvo foi restaurado.");
  });
  $("clearPart").addEventListener("click", () => change({ [category]: null }));
  $("undo").addEventListener("click", () => {
    if (!past.length) return;
    future.push(copy(draft));
    draft = past.pop();
    render();
    say("Última escolha desfeita.");
  });
  $("redo").addEventListener("click", () => {
    if (!future.length) return;
    past.push(copy(draft));
    draft = future.pop();
    render();
    say("Escolha refeita.");
  });
  for (const b of document.querySelectorAll("[data-category]")) {
    b.addEventListener("click", () => {
      category = b.dataset.category;
      render();
    });
    b.addEventListener("keydown", (e) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const tabs = [...document.querySelectorAll("[data-category]")],
        i = tabs.indexOf(b),
        next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                tabs.length;
      category = tabs[next].dataset.category;
      render();
      tabs[next].focus();
    });
  }
  $("front").addEventListener("click", () => {
    view = "front";
    render();
    say("Vista de frente.");
  });
  $("back").addEventListener("click", () => {
    view = "back";
    render();
    say("Vista de costas.");
  });

  const media = matchMedia("(prefers-reduced-motion:reduce)");
  let pause = media.matches;
  function motion() {
    document.body.classList.toggle(
      "motion-paused",
      pause ||
        media.matches ||
        document.body.classList.contains("astro-motion-off"),
    );
    $("motion").disabled =
      media.matches || document.body.classList.contains("astro-motion-off");
    $("motion").setAttribute(
      "aria-pressed",
      String(
        pause ||
          media.matches ||
          document.body.classList.contains("astro-motion-off"),
      ),
    );
    $("motion").textContent =
      media.matches || document.body.classList.contains("astro-motion-off")
        ? "Movimento reduzido"
        : pause
          ? "Retomar animações"
          : "Pausar animações";
  }
  $("motion").addEventListener("click", () => {
    pause = !pause;
    motion();
  });
  media.addEventListener?.("change", motion);
  document.addEventListener("astrolearn:preferences", motion);
  motion();
  const help =
    "Escolha um dos quatro mascotes: cada um mantém sua estrutura. Depois selecione tronco, pernas e um acessório opcional. Use Frente e Costas para conferir. As imagens são vistas renderizadas, com sombras preparadas nas peças. Salvar guarda o visual e o inventário só neste navegador; não está conectado à conta ou ao saldo real da plataforma.";
  $("about").addEventListener("click", () =>
    info("Seu explorador, passo a passo", help),
  );
  $("helper").addEventListener("click", () =>
    info("Uma ajuda na oficina?", help),
  );
  for (const b of document.querySelectorAll("[data-soon]"))
    b.addEventListener("click", () =>
      info(b.dataset.soon, "Esta área será construída na próxima etapa."),
    );
  /* Recursos ausentes produzem um aviso; nunca bloqueiam teclado ou formulários. */
  for (const c of characters) {
    const img = new Image();
    img.onerror = () => {
      $("error").textContent =
        "Uma imagem do personagem não carregou. Recarregue a página para tentar novamente.";
    };
    img.src = "../public/assets/imagens/aluno/loja/" + c.id + ".png";
  }
  render();
  if (storageIssue)
    $("error").textContent =
      "Não foi possível ler o visual anterior. Nenhum dado foi sobrescrito; você pode experimentar e tentar salvar novamente.";
})();
