/* Nunca persiste senhas. O parâmetro demo apenas libera a prévia visual. */
(() => {
  const $ = (id) => document.getElementById(id),
    demo = new URLSearchParams(location.search).get("demo") === "1";
  if (!demo) {
    $("resetForm").hidden = true;
    $("invalidLink").hidden = false;
  }
  document.querySelectorAll("[data-reveal]").forEach(
    (b) =>
      (b.onclick = () => {
        const input = $(b.dataset.reveal),
          show = input.type === "password";
        input.type = show ? "text" : "password";
        b.setAttribute("aria-pressed", String(show));
        b.setAttribute(
          "aria-label",
          (show ? "Ocultar" : "Mostrar") +
            (b.dataset.reveal === "newPassword"
              ? " nova senha"
              : " confirmação da senha"),
        );
      }),
  );
  function error(input, id, message) {
    $(id).textContent = message;
    $(input).setAttribute("aria-invalid", String(Boolean(message)));
  }
  $("resetForm").onsubmit = (e) => {
    e.preventDefault();
    if (!demo) return;
    const valid =
        $("newPassword").value.length >= 8 &&
        $("newPassword").value.length <= 128,
      match =
        $("confirmPassword").value !== "" &&
        $("confirmPassword").value === $("newPassword").value;
    error(
      "newPassword",
      "passwordError",
      valid ? "" : "Use entre 8 e 128 caracteres.",
    );
    error(
      "confirmPassword",
      "confirmError",
      match ? "" : "As senhas precisam ser iguais.",
    );
    if (!valid || !match) {
      $(valid ? "confirmPassword" : "newPassword").focus();
      return;
    }
    $("resetForm").reset();
    $("resetForm").hidden = true;
    $("resetResult").hidden = false;
    $("resetResult").tabIndex = -1;
    $("resetResult").focus();
  };
})();
