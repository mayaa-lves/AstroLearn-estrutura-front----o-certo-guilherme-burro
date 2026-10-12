import {
  saveProgress,
  result,
  initDialogs,
} from "../../../components/jogos.js";
const $ = (id) => document.getElementById(id);
const stations = [
  {
    role: "Navegação",
    icon: '<path d="m12 3 8 18-8-4-8 4Z"/>',
    q: "A nave está em (1, 1) e deve ir para (3, 2). Qual rota chega ao destino?",
    options: [
      "Duas casas à direita e uma para cima",
      "Duas casas à direita e uma para baixo",
      "Três casas para a esquerda",
    ],
    answer: 1,
    why: "Considere x crescendo para a direita e y para baixo: (1,1) → (3,1) → (3,2). O grupo precisa combinar a mesma referência.",
  },
  {
    role: "Engenharia",
    icon: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
    q: "A bateria tem 10 unidades. Motor usa 4 e comunicação usa 3. Quantas unidades restam?",
    options: ["3 unidades", "7 unidades", "1 unidade"],
    answer: 0,
    why: "10 − 4 − 3 = 3. Verificar o consumo ajuda a planejar a energia disponível.",
  },
  {
    role: "Ciência",
    icon: '<path d="M9 3h6m-5 0v7L4 21h16l-6-11V3M7 15h10"/>',
    q: "Como comparar dois protótipos de rover de forma mais justa?",
    options: [
      "Mudar terreno, peso e rodas ao mesmo tempo",
      "Testar cada um em um planeta diferente",
      "Usar o mesmo terreno e carga, mudando apenas o tipo de roda",
    ],
    answer: 2,
    why: "Controlar as outras condições permite investigar melhor a influência da roda no desempenho.",
  },
  {
    role: "Comunicação",
    icon: '<path d="M4 4h16v12H9l-5 5ZM8 8h8m-8 4h5"/>',
    q: "Um integrante não entendeu sua tarefa. Qual decisão ajuda a equipe?",
    options: [
      "Explicar os passos e pedir que ele conte como entendeu",
      "Fazer tudo sem conversar",
      "Ignorar e seguir sozinho",
    ],
    answer: 0,
    why: "Explicar e conferir a compreensão ajuda a equipe a agir com a mesma informação. Todos têm um papel na expedição.",
  },
];
let index = 0,
  started = false,
  done = false;
function map() {
  const root = $("crewMap");
  root.replaceChildren();
  stations.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "crew-station" + (i < index || done ? " done" : "");
    d.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + s.icon + "</svg>";
    const span = document.createElement("span");
    span.textContent = s.role + (i < index || done ? " · pronta" : "");
    d.append(span);
    root.append(d);
  });
}
function question() {
  const v = stations[index];
  $("crewQuestion").hidden = false;
  $("crewIntro").hidden = true;
  $("crewRole").textContent = "Estação " + (index + 1) + " de 4 · " + v.role;
  $("crewTitle").textContent = v.q;
  $("crewOptions").replaceChildren();
  v.options.forEach((text, i) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "crewAnswer";
    input.value = i;
    const span = document.createElement("span");
    span.textContent = text;
    label.append(input, span);
    $("crewOptions").append(label);
  });
  $("crewConfirm").hidden = false;
  $("crewNext").hidden = true;
  $("crewFeedback").hidden = true;
  $("crewError").textContent = "";
  $("crewTitle").focus();
  map();
}
$("startCrew").onclick = () => {
  started = true;
  index = 0;
  done = false;
  $("crewFinal").textContent = "";
  question();
};
$("crewForm").onsubmit = (e) => {
  e.preventDefault();
  if (!started || done) return;
  const option = document.querySelector("input[name=crewAnswer]:checked");
  if (!option) {
    $("crewError").textContent = "Escolha uma decisão com sua equipe.";
    return;
  }
  const v = stations[index],
    correct = Number(option.value) === v.answer;
  $("crewError").textContent = "";
  $("crewFeedback").hidden = false;
  $("crewFeedback").classList.toggle("wrong", !correct);
  $("crewFeedback").textContent = correct
    ? "Estação pronta! " + v.why
    : "Revejam a decisão. " +
      (index === 0
        ? "A segunda coordenada cresce para baixo."
        : index === 1
          ? "Some os dois consumos e subtraia do total."
          : index === 2
            ? "Uma comparação justa mantém as demais condições iguais."
            : "É importante verificar se todos compreenderam.");
  if (correct) {
    $("crewConfirm").hidden = true;
    document
      .querySelectorAll("input[name=crewAnswer]")
      .forEach((i) => (i.disabled = true));
    $("crewNext").hidden = false;
    $("crewNext").textContent =
      index === 3 ? "Concluir expedição" : "Passar para a próxima função";
  }
};
$("crewNext").onclick = () => {
  if (index < 3) {
    index++;
    question();
  } else {
    done = true;
    started = false;
    index = 4;
    map();
    $("crewQuestion").hidden = true;
    $("crewIntro").hidden = false;
    $("startCrew").textContent = "Nova expedição";
    $("crewFinal").textContent = "Quatro estações prontas. A nave pode partir!";
    const saved = saveProgress("crew", true);
    $("resultContinue").textContent = "Nova expedição";
    result(
      "A tripulação conseguiu!",
      "Vocês planejaram uma rota, cuidaram da energia, investigaram e se comunicaram.",
      saved
        ? "Resultado salvo somente neste navegador."
        : "Não foi possível salvar o resultado neste navegador.",
    );
  }
};
$("resultContinue").onclick = () => {
  $("resultDialog").close();
  index = 0;
  done = false;
  started = false;
  map();
  $("crewIntro").hidden = false;
  $("crewFinal").textContent = "";
  $("startCrew").focus();
};
initDialogs();
map();
