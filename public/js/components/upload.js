// Seleção local de arquivos.
// A API fará a validação definitiva do conteúdo.

export const LIMITES_ANEXOS = {
  quantidade: 10,
  porArquivo: 20 * 1024 * 1024,
  total: 50 * 1024 * 1024,
};

const extensoes = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "txt",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
]);

const fotos = new Set(["jpg", "jpeg", "png", "webp"]);

export function tamanhoLegivel(bytes) {
  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function conectarUpload({
  input,
  botao,
  dropzone,
  lista,
  status,
  contador,
  onChange = () => {},
}) {
  const itens = [];
  let proximoId = 1;
  let profundidade = 0;

  const total = () => itens.reduce((soma, item) => soma + item.file.size, 0);

  function mensagem(texto, falhou = false) {
    status.textContent = texto;
    status.dataset.error = String(falhou);
  }

  // Renderizar sem inserir nomes de arquivos como HTML.

  function renderizar() {
    lista.replaceChildren();

    itens.forEach((item) => {
      const li = document.createElement("li");
      li.className = "attachment-item";

      if (item.url) {
        const img = document.createElement("img");
        img.src = item.url;
        img.alt = "";
        img.className = "attachment-thumb";
        li.append(img);
      } else {
        const simbolo = document.createElement("span");

        simbolo.className = "attachment-thumb attachment-symbol";
        simbolo.textContent = item.ext.toUpperCase();
        simbolo.setAttribute("aria-hidden", "true");

        li.append(simbolo);
      }

      const info = document.createElement("span");
      info.className = "attachment-info";

      const nome = document.createElement("span");
      nome.className = "attachment-name";
      nome.textContent = item.file.name;

      const tamanho = document.createElement("span");
      tamanho.className = "attachment-size";
      tamanho.textContent = tamanhoLegivel(item.file.size);

      info.append(nome, tamanho);

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "attachment-remove";
      remover.textContent = "×";

      remover.setAttribute("aria-label", "Remover " + item.file.name);

      remover.addEventListener("click", () => {
        const indice = itens.findIndex((arquivo) => arquivo.id === item.id);

        if (indice === -1) return;

        const [excluido] = itens.splice(indice, 1);

        if (excluido.url) {
          URL.revokeObjectURL(excluido.url);
        }

        renderizar();
        mensagem("Anexo removido: " + excluido.file.name);
        onChange();

        const botoes = lista.querySelectorAll("button");

        (botoes[Math.min(indice, botoes.length - 1)] || botao).focus();
      });

      li.append(info, remover);
      lista.append(li);
    });

    contador.textContent = itens.length
      ? itens.length +
        " de " +
        LIMITES_ANEXOS.quantidade +
        " arquivos · " +
        tamanhoLegivel(total())
      : "Nenhum arquivo selecionado.";
  }

  // Conferir extensão, quantidade e tamanho antes de adicionar.

  function adicionar(arquivos) {
    const erros = [];
    let adicionados = 0;

    for (const file of arquivos) {
      const ext = file.name.split(".").pop().toLowerCase();

      const repetido = itens.some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified,
      );

      if (!extensoes.has(ext)) {
        erros.push(file.name + ": formato não permitido.");
        continue;
      }

      if (!file.size) {
        erros.push(file.name + ": o arquivo está vazio.");
        continue;
      }

      if (file.size > LIMITES_ANEXOS.porArquivo) {
        erros.push(file.name + ": ultrapassa 20 MB.");
        continue;
      }

      if (repetido) {
        erros.push(file.name + ": já está na lista.");
        continue;
      }

      if (itens.length >= LIMITES_ANEXOS.quantidade) {
        erros.push("Você pode selecionar até 10 arquivos.");
        break;
      }

      if (total() + file.size > LIMITES_ANEXOS.total) {
        erros.push(file.name + ": o total ultrapassaria 50 MB.");
        continue;
      }

      let url = null;

      if (fotos.has(ext)) {
        try {
          url = URL.createObjectURL(file);
        } catch {}
      }

      itens.push({
        id: proximoId++,
        file,
        ext,
        url,
      });

      adicionados++;
    }

    renderizar();

    const resumo = adicionados
      ? adicionados + " arquivo(s) selecionado(s) localmente."
      : "";

    mensagem([resumo, ...erros].filter(Boolean).join("\n"), erros.length > 0);

    if (adicionados) {
      onChange();
    }
  }

  // Botão e seleção pelo navegador.

  const abrir = () => input.click();

  const selecionar = () => {
    adicionar([...input.files]);
    input.value = "";
  };

  // Arrastar e soltar.

  function arrastar(event) {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function entrar(event) {
    event.preventDefault();
    profundidade++;

    dropzone.classList.add("drag-active");
  }

  function sair(event) {
    event.preventDefault();
    profundidade = Math.max(0, profundidade - 1);

    if (!profundidade) {
      dropzone.classList.remove("drag-active");
    }
  }

  function soltar(event) {
    event.preventDefault();
    profundidade = 0;

    dropzone.classList.remove("drag-active");
    adicionar([...event.dataTransfer.files]);
  }

  botao.addEventListener("click", abrir);
  input.addEventListener("change", selecionar);

  dropzone.addEventListener("dragover", arrastar);
  dropzone.addEventListener("dragenter", entrar);
  dropzone.addEventListener("dragleave", sair);
  dropzone.addEventListener("drop", soltar);

  renderizar();

  return {
    getFiles: () => itens.map((item) => item.file),

    adicionar,

    destroy() {
      itens.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });

      itens.length = 0;

      botao.removeEventListener("click", abrir);
      input.removeEventListener("change", selecionar);

      dropzone.removeEventListener("dragover", arrastar);
      dropzone.removeEventListener("dragenter", entrar);
      dropzone.removeEventListener("dragleave", sair);
      dropzone.removeEventListener("drop", soltar);
    },
  };
}
