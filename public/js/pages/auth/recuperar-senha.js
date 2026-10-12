/* Apenas validação visual. Não envia e-mail nem identifica contas. */
(() => {
  const $ = (id) => document.getElementById(id);
  $("recoveryForm").onsubmit = (e) => {
    e.preventDefault();
    const input = $("email"),
      valid = input.value.trim() !== "" && input.validity.valid;
    input.setAttribute("aria-invalid", String(!valid));
    $("emailError").textContent = valid ? "" : "Digite um e-mail válido.";
    if (!valid) {
      input.focus();
      return;
    }
    $("recoveryForm").hidden = true;
    $("recoveryResult").hidden = false;
    $("recoveryResult").tabIndex = -1;
    $("recoveryResult").focus();
  };
  $("email").oninput = () => {
    $("emailError").textContent = "";
    $("email").removeAttribute("aria-invalid");
  };
  $("tryAgain").onclick = () => {
    $("recoveryResult").hidden = true;
    $("recoveryForm").hidden = false;
    $("email").focus();
  };
})();
