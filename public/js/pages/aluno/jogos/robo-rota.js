/* Movimento determinístico: uma casa por comando, sem dependência de FPS. */
import {
  saveProgress,
  result,
  initDialogs,
  reduced,
} from "../../../components/jogos.js";
const $ = (id) => document.getElementById(id),
  arrows = { up: "↑", right: "→", down: "↓", left: "←" },
  directions = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const levels = [
  {
    title: "Primeiros comandos",
    start: [0, 4],
    goal: [4, 0],
    walls: [
      [1, 3],
      [2, 3],
      [3, 1],
    ],
    hint: "Comece subindo pela coluna da esquerda. Observe onde as rochas interrompem o caminho.",
  },
  {
    title: "Desvie das rochas",
    start: [0, 4],
    goal: [4, 0],
    walls: [
      [1, 4],
      [1, 3],
      [1, 2],
      [3, 0],
      [3, 1],
    ],
    hint: "Procure um espaço entre as duas barreiras. Subir pela primeira coluna ajuda a começar.",
  },
  {
    title: "Uma rota completa",
    start: [0, 4],
    goal: [4, 0],
    walls: [
      [0, 2],
      [1, 2],
      [3, 4],
      [3, 3],
      [2, 1],
      [3, 1],
    ],
    hint: "Passe pela linha 4, entre as barreiras, e procure a coluna da direita.",
  },
];
let level = 0,
  commands = [],
  position = [...levels[0].start],
  running = false,
  timer = 0,
  token = 0;
const robot =
  '<span class="robot" aria-hidden="true"><svg viewBox="0 0 30 30"><rect x="5" y="9" width="20" height="16" rx="4"/><path d="M15 9V3m-2 0h4M10 21h10"/><circle cx="11" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/></svg></span>';
function paint() {
  const v = levels[level];
  $("board").replaceChildren();
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (v.walls.some((p) => p[0] === x && p[1] === y))
        cell.classList.add("wall");
      if (v.goal[0] === x && v.goal[1] === y) cell.classList.add("base");
      if (position[0] === x && position[1] === y) cell.innerHTML = robot;
      $("board").append(cell);
    }
  $("board").setAttribute(
    "aria-label",
    `Mapa 5 por 5. Robô na coluna ${position[0] + 1}, linha ${position[1] + 1}. Base na coluna ${v.goal[0] + 1}, linha ${v.goal[1] + 1}. Rochas: ${v.walls.map((p) => "coluna " + (p[0] + 1) + ", linha " + (p[1] + 1)).join("; ")}.`,
  );
}
function controls() {
  document
    .querySelectorAll("[data-command]")
    .forEach((b) => (b.disabled = running || commands.length >= 20));
  ["undoCommand", "clearCommands"].forEach(
    (id) => ($(id).disabled = running || !commands.length),
  );
  $("run").disabled = running;
  $("run").textContent = running ? "Executando…" : "Executar rota";
}
function sequence() {
  const list = $("commands");
  list.replaceChildren();
  commands.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "command-chip";
    b.textContent = arrows[c];
    b.disabled = running;
    b.setAttribute(
      "aria-label",
      `Remover comando ${i + 1}: ${{ up: "cima", right: "direita", down: "baixo", left: "esquerda" }[c]}`,
    );
    b.onclick = () => {
      commands.splice(i, 1);
      sequence();
    };
    list.append(b);
  });
  $("commandCount").textContent = commands.length + " de 20 comandos";
  controls();
}
function add(c) {
  if (running) return;
  if (commands.length >= 20) {
    $("gameStatus").textContent =
      "Limite de 20 comandos. Remova um comando para acrescentar outro.";
    return;
  }
  commands.push(c);
  sequence();
  $("gameStatus").textContent =
    "Comando adicionado. Execute quando a rota estiver pronta.";
}
function load() {
  token++;
  clearTimeout(timer);
  running = false;
  commands = [];
  position = [...levels[level].start];
  $("levelTitle").textContent = levels[level].title;
  $("hintText").textContent = "";
  document
    .querySelectorAll(".level-steps span")
    .forEach((s, i) => s.classList.toggle("current", i === level));
  $("mapDescription").textContent =
    "Mapa 5 × 5. Linhas são contadas de cima para baixo, colunas da esquerda para a direita.";
  paint();
  sequence();
  $("gameStatus").textContent =
    "Desafio " + (level + 1) + " de 3. Planeje a rota até a base.";
}
function stop(message) {
  running = false;
  token++;
  clearTimeout(timer);
  sequence();
  $("gameStatus").textContent = message;
}
function execute() {
  if (running) return;
  if (!commands.length) {
    $("gameStatus").textContent =
      "Adicione pelo menos um comando antes de executar.";
    return;
  }
  running = true;
  position = [...levels[level].start];
  paint();
  sequence();
  const id = ++token;
  let i = 0;
  function step() {
    if (id !== token) return;
    if (i >= commands.length) {
      stop(
        "A rota terminou antes da base. Ajuste os comandos e tente novamente.",
      );
      return;
    }
    const c = commands[i],
      d = directions[c],
      x = position[0] + d[0],
      y = position[1] + d[1];
    if (
      x < 0 ||
      x > 4 ||
      y < 0 ||
      y > 4 ||
      levels[level].walls.some((p) => p[0] === x && p[1] === y)
    ) {
      stop(
        "O comando " +
          (i + 1) +
          " encontrou uma rocha ou a borda. O robô parou. Revise sua rota.",
      );
      return;
    }
    position = [x, y];
    paint();
    $("commands").children[i]?.classList.add("running");
    i++;
    $("gameStatus").textContent =
      "Comando " +
      i +
      ": robô na coluna " +
      (x + 1) +
      ", linha " +
      (y + 1) +
      ".";
    if (x === levels[level].goal[0] && y === levels[level].goal[1]) {
      running = false;
      sequence();
      const saved = saveProgress("robo", level + 1);
      $("resultContinue").textContent =
        level < 2 ? "Próximo desafio" : "Jogar novamente";
      result(
        level < 2 ? "Rota concluída!" : "Explorador programado!",
        `Você levou o robô à base usando ${i} comandos. Planejar, testar e corrigir é parte da programação.`,
        saved
          ? "Progresso salvo somente neste navegador."
          : "Resultado não foi salvo: armazenamento indisponível.",
      );
      return;
    }
    timer = setTimeout(step, reduced() ? 0 : 450);
  }
  step();
}
$("board").tabIndex = 0;
$("board").addEventListener("keydown", (e) => {
  const d = {
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowLeft: "left",
  }[e.key];
  if (d) {
    e.preventDefault();
    add(d);
  }
});
document
  .querySelectorAll("[data-command]")
  .forEach((b) => (b.onclick = () => add(b.dataset.command)));
$("run").onclick = execute;
$("undoCommand").onclick = () => {
  commands.pop();
  sequence();
};
$("clearCommands").onclick = () => {
  commands = [];
  position = [...levels[level].start];
  paint();
  sequence();
};
$("hint").onclick = () => ($("hintText").textContent = levels[level].hint);
$("resultContinue").onclick = () => {
  $("resultDialog").close();
  level = (level + 1) % 3;
  load();
  $("board").focus();
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running)
    stop(
      "Execução pausada ao sair da página. Execute a rota novamente quando voltar.",
    );
});
window.addEventListener("pagehide", () => {
  token++;
  clearTimeout(timer);
});
initDialogs();
load();
