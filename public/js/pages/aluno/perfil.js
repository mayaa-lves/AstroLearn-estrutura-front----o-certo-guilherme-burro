/* Perfil demonstrativo: dados de vínculo não são editáveis pelo aluno. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    prefs = window.AstroPrefs,
    NAME_KEY = "astrolearn-display-name-v1";
  let origin = null,
    name = "Maya";
  try {
    const raw = JSON.parse(localStorage.getItem(NAME_KEY) || "null");
    if (
      raw?.version === 1 &&
      typeof raw.name === "string" &&
      raw.name.trim().length >= 2 &&
      raw.name.trim().length <= 40
    )
      name = raw.name.trim();
  } catch {
    $("pageError").textContent =
      "Não foi possível ler o nome salvo. Você pode editar o nome e tentar salvar novamente.";
  }
  $("studentName").textContent = name;
  function values() {
    return {
      animations: prefs.systemReduced() ? prefs.get().animations : $("animations").checked,
      textSize: Number($("textSize").value),
      contrast: $("contrast").checked,
    };
  }
  function controls(v) {
    $("animations").checked = v.animations && !prefs.systemReduced();
    $("animations").disabled = prefs.systemReduced();
    $("animationHint").textContent = prefs.systemReduced()
      ? "Seu sistema está configurado para reduzir movimentos."
      : "Movimentos suaves na plataforma.";
    $("textSize").value = String(v.textSize);
    $("contrast").checked = v.contrast;
    range();
  }
  function range() {
    const value = Number($("textSize").value);
    $("textSizeValue").textContent = value + "%";
    $("textSize").setAttribute("aria-valuetext", value + " por cento");
    $("textSize").style.setProperty(
      "--range-fill",
      ((value - 100) / 50) * 100 + "%",
    );
  }
  function preview() {
    range();
    prefs.preview(values());
    $("preferenceStatus").textContent =
      "Prévia aplicada. Salve para manter as mudanças.";
    $("pageError").textContent = "";
  }
  $("textSize").addEventListener("input", preview);
  $("animations").addEventListener("change", preview);
  $("contrast").addEventListener("change", preview);
  $("preferencesForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (prefs.save(values())) {
      $("preferenceStatus").textContent = "Preferências salvas ✓";
      $("pageError").textContent = "";
    } else {
      $("preferenceStatus").textContent = "";
      $("pageError").textContent =
        "Não foi possível salvar as preferências. Os ajustes estão em prévia, e os valores salvos anteriormente foram mantidos. Permita o armazenamento do site ou libere espaço e tente novamente.";
    }
  });
  $("restore").addEventListener("click", () => {
    controls(prefs.defaults);
    prefs.preview(prefs.defaults);
    $("preferenceStatus").textContent =
      "Padrão restaurado em prévia. Salve para confirmar.";
    $("pageError").textContent = "";
  });
  function open(id) {
    origin = document.activeElement;
    $(id).showModal();
  }
  function close(d) {
    d.close();
    if (origin?.isConnected) origin.focus();
  }
  $("editName").addEventListener("click", () => {
    $("displayName").value = name;
    $("nameError").textContent = "";
    open("nameDialog");
    $("displayName").focus();
  });
  $("nameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const next = $("displayName").value.trim().replace(/\s+/g, " ");
    if (next.length < 2 || next.length > 40) {
      $("nameError").textContent =
        "Use entre 2 e 40 caracteres para seu nome de exibição.";
      $("displayName").focus();
      return;
    }
    try {
      localStorage.setItem(
        NAME_KEY,
        JSON.stringify({ version: 1, name: next }),
      );
    } catch {
      $("nameError").textContent =
        "Não foi possível salvar o nome. Seu nome anterior foi mantido. Tente novamente após permitir o armazenamento.";
      return;
    }
    name = next;
    $("studentName").textContent = name;
    close($("nameDialog"));
    $("preferenceStatus").textContent = "Nome de exibição salvo ✓";
  });
  for (const b of document.querySelectorAll("[data-close]"))
    b.addEventListener("click", () => close(b.closest("dialog")));
  for (const d of document.querySelectorAll("dialog"))
    d.addEventListener("cancel", () => origin?.isConnected && origin.focus());
  $("helper").addEventListener("click", () => open("info"));
  controls(prefs.get());
  if (prefs.readError())
    $("pageError").textContent =
      "Não foi possível ler as preferências anteriores. Nenhum ajuste salvo foi substituído.";
  document.addEventListener("astrolearn:preferences", () => {
    if (prefs.systemReduced()) {
      $("animations").disabled = true;
      $("animations").checked = false;
      $("animationHint").textContent =
        "Seu sistema está configurado para reduzir movimentos.";
    } else {
      $("animations").disabled = false;
      $("animations").checked = prefs.get().animations;
      $("animationHint").textContent = "Movimentos suaves na plataforma.";
    }
  });
})();
