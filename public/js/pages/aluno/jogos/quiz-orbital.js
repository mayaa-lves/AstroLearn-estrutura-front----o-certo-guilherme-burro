import { saveProgress, initDialogs } from "../../../components/jogos.js";
const $ = (id) => document.getElementById(id);
// Conteúdo básico de ciências, com explicação em cada alternativa correta.
const questions = [
  {
    q: "Qual estrela fica no centro do Sistema Solar?",
    options: ["Lua", "Sol", "Terra"],
    answer: 1,
    why: "O Sol é uma estrela. Os planetas do Sistema Solar orbitam ao seu redor.",
  },
  {
    q: "Por que temos dias e noites na Terra?",
    options: [
      "Porque a Terra gira em torno de si mesma",
      "Porque a Lua esconde o Sol todos os dias",
      "Porque o Sol apaga à noite",
    ],
    answer: 0,
    why: "A rotação da Terra faz diferentes regiões receberem luz solar. A parte voltada para o Sol tem dia; a outra tem noite.",
  },
  {
    q: "O que é um satélite natural?",
    options: [
      "Uma nave construída por pessoas",
      "Um astro que orbita outro astro, como a Lua ao redor da Terra",
      "Um telescópio na superfície",
    ],
    answer: 1,
    why: "Um satélite natural orbita um corpo maior. A Lua é o satélite natural da Terra.",
  },
  {
    q: "Qual planeta é conhecido pelos seus grandes anéis?",
    options: ["Mercúrio", "Marte", "Saturno"],
    answer: 2,
    why: "Saturno tem anéis muito visíveis, compostos principalmente por partículas de gelo. Outros planetas gigantes também têm anéis.",
  },
  {
    q: "Por que um astronauta precisa de traje fora da nave?",
    options: [
      "Para ter oxigênio e proteção no ambiente espacial",
      "Só para reconhecer a equipe",
      "Para ficar mais pesado que os planetas",
    ],
    answer: 0,
    why: "O traje fornece oxigênio, mantém uma pressão adequada e ajuda a proteger o astronauta das condições do espaço.",
  },
  {
    q: "Um robô segue uma sequência de comandos. Qual habilidade você está usando ao planejar essa sequência?",
    options: [
      "Adivinhação",
      "Pensamento computacional",
      "Memorizar cores sem ordem",
    ],
    answer: 1,
    why: "Decompor um problema, planejar passos e testar uma sequência são práticas do pensamento computacional.",
  },
];
let index = 0,
  records = [],
  confirmed = false;
function question() {
  const v = questions[index];
  confirmed = false;
  $("questionPanel").hidden = false;
  $("quizResult").hidden = true;
  $("quizIntro").hidden = true;
  $("questionCount").textContent =
    "Pergunta " + (index + 1) + " de " + questions.length;
  $("quizProgress").value = index;
  $("questionTitle").textContent = v.q;
  $("answers").replaceChildren();
  v.options.forEach((text, i) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = i;
    const span = document.createElement("span");
    span.textContent = text;
    label.append(input, span);
    $("answers").append(label);
  });
  $("quizError").textContent = "";
  $("explanation").hidden = true;
  $("confirmAnswer").hidden = false;
  $("nextQuestion").hidden = true;
  $("questionTitle").focus();
}
$("startQuiz").onclick = () => {
  index = 0;
  records = [];
  question();
};
$("answerForm").onsubmit = (e) => {
  e.preventDefault();
  if (confirmed) return;
  const input = document.querySelector("input[name=answer]:checked");
  if (!input) {
    $("quizError").textContent = "Escolha uma alternativa antes de confirmar.";
    document.querySelector("input[name=answer]").focus();
    return;
  }
  confirmed = true;
  const choice = Number(input.value),
    v = questions[index],
    correct = choice === v.answer;
  records.push({ choice, correct });
  $("quizError").textContent = "";
  document
    .querySelectorAll("input[name=answer]")
    .forEach((i) => (i.disabled = true));
  $("confirmAnswer").hidden = true;
  $("explanation").hidden = false;
  $("explanation").classList.toggle("wrong", !correct);
  $("explanation").textContent =
    (correct
      ? "Boa descoberta! "
      : "Vamos investigar: a resposta é “" + v.options[v.answer] + "”. ") +
    v.why;
  $("nextQuestion").hidden = false;
  $("nextQuestion").textContent =
    index === questions.length - 1 ? "Ver resultado" : "Próxima pergunta";
  $("quizProgress").value = index + 1;
};
$("nextQuestion").onclick = () => {
  if (!confirmed) return;
  if (index < questions.length - 1) {
    index++;
    question();
  } else {
    const score = records.filter((r) => r.correct).length;
    $("questionPanel").hidden = true;
    $("quizResult").hidden = false;
    $("score").textContent = score + " / " + questions.length;
    $("quizSaved").textContent = saveProgress("quiz", score)
      ? "Melhor resultado salvo neste navegador. Continue explorando!"
      : "Resultado concluído. Não foi possível salvar neste navegador.";
    $("review").replaceChildren();
    questions.forEach((q, i) => {
      const li = document.createElement("li"),
        strong = document.createElement("strong"),
        p = document.createElement("p");
      strong.textContent = (records[i].correct ? "✓ " : "↗ ") + q.q;
      p.textContent =
        "Sua resposta: " +
        q.options[records[i].choice] +
        ". Resposta correta: " +
        q.options[q.answer] +
        ". " +
        q.why;
      li.append(strong, p);
      $("review").append(li);
    });
    $("quizResultTitle").focus();
  }
};
$("restartQuiz").onclick = () => {
  index = 0;
  records = [];
  question();
};
initDialogs();
$("resultContinue").onclick = () => $("resultDialog").close();
