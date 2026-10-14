const main = document.querySelector("main");
if (main) {
  const p = document.createElement("p");
  p.className = "preview-note";
  p.setAttribute("role", "status");
  p.textContent = location.pathname.includes("conquistas")
    ? "Prévia das conquistas: o backend ainda não oferece consulta das recompensas da sua conta. Os exemplos abaixo não representam seu progresso real."
    : location.pathname.includes("/jogos/")
      ? "Jogos educativos locais: pontuação e progresso não são enviados à conta ou ao professor."
      : "Personalização local: catálogo, saldo e roupas são demonstrativos. Compras e visual ainda não são salvos na sua conta.";
  main.prepend(p);
}
