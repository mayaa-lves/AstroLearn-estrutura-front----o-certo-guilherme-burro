/* Nome de exibição da prévia. Dados escolares serão fornecidos pela API. */
(() => {
  function render() {
    let name = "Maya";
    try {
      const v = JSON.parse(
        localStorage.getItem("astrolearn-display-name-v1") || "null",
      );
      if (
        v?.version === 1 &&
        typeof v.name === "string" &&
        v.name.trim().length >= 2 &&
        v.name.length <= 40
      )
        name = v.name.trim();
    } catch {}
    const el = document.getElementById("welcomeTitle");
    if (el) el.textContent = "Boas-vindas, " + name + "!";
    document
      .querySelectorAll("[data-student-name]")
      .forEach((el) => (el.textContent = name));
  }
  render();
  window.addEventListener("storage", render);
})();
