const caracteres = {
  maiusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  numeros: "0123456789",
  simbolos: "!@#$%&*?+-_=."
};

const senhaInput = document.querySelector("#senha");
const copyBotao = document.querySelector("#botao");
const copyStatus = document.querySelector("#copyStatus");
const formc = document.querySelector("#form");
const lengthInput = document.querySelector("#length");
const lengthValue = document.querySelector("#comprimento");
const strengthLabel = document.querySelector("#medidor");
const strengthBar = document.querySelector("#vazio");
const optionInputs = [...document.querySelectorAll(".opcao input")];

let copyTimeout = null;

function indiceAleatorio(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const valores = new Uint32Array(1);
    window.crypto.getRandomValues(valores);
    return valores[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function embaralhar(texto) {
  const caracteresArr = [...texto];
  for (let index = caracteresArr.length - 1; index > 0; index -= 1) {
    const swapIndex = indiceAleatorio(index + 1);
    [caracteresArr[index], caracteresArr[swapIndex]] = [caracteresArr[swapIndex], caracteresArr[index]];
  }
  return caracteresArr.join("");
}

function conjuntosSelecionados() {
  return optionInputs
    .filter((input) => input.checked)
    .map((input) => caracteres[input.id]);
}

function estimarResistencia(tamanho, qtdSelecionados) {
  if (tamanho < 8 || qtdSelecionados <= 1) {
    return { label: "Fraca", width: "25%", color: "#dc2626" };
  }

  const pontuacao = tamanho + qtdSelecionados * 5;

  if (pontuacao >= 32) {
    return { label: "Muito forte", width: "100%", color: "#16a34a" };
  }

  if (pontuacao >= 24) {
    return { label: "Forte", width: "75%", color: "#0d9488" };
  }

  if (pontuacao >= 16) {
    return { label: "Média", width: "50%", color: "#d97706" };
  }

  return { label: "Fraca", width: "25%", color: "#dc2626" };
}

function atualizarForca() {
  const selecionados = conjuntosSelecionados();
  const strength = estimarResistencia(Number(lengthInput.value), selecionados.length);

  strengthLabel.textContent = strength.label;
  strengthLabel.style.color = strength.color;
  strengthBar.style.width = strength.width;
  strengthBar.style.backgroundColor = strength.color;
}

function gerarSenha() {
  const selecionados = conjuntosSelecionados();
  const tamanho = Number(lengthInput.value);

  lengthValue.textContent = String(tamanho);

  if (selecionados.length === 0) {
    optionInputs[0].checked = true;
    selecionados.push(caracteres[optionInputs[0].id]);
  }

  const todosCaracteres = selecionados.join("");
  const caracteresObrigatorios = selecionados.map((conjunto) => conjunto[indiceAleatorio(conjunto.length)]);
  const tamanhoRestante = Math.max(0, tamanho - caracteresObrigatorios.length);
  const caracteresAleatorios = Array.from({ length: tamanhoRestante }, () => {
    return todosCaracteres[indiceAleatorio(todosCaracteres.length)];
  });

  senhaInput.value = embaralhar([...caracteresObrigatorios, ...caracteresAleatorios].join("")).slice(0, tamanho);
  atualizarForca();
}

async function copiarSenha() {
  if (!senhaInput.value) return;

  let sucesso = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(senhaInput.value);
      sucesso = true;
    } catch {
      sucesso = false;
    }
  }

  if (!sucesso) {
    try {
      senhaInput.select();
      senhaInput.setSelectionRange(0, 99999);
      sucesso = document.execCommand("copy");
    } catch {
      sucesso = false;
    }
  }

  if (copyTimeout) {
    clearTimeout(copyTimeout);
  }

  if (sucesso) {
    copyStatus.textContent = "Senha copiada com sucesso!";
    copyStatus.style.color = "#16a34a";
    copyBotao.textContent = "Copiado!";
  } else {
    copyStatus.textContent = "Não foi possível copiar automaticamente.";
    copyStatus.style.color = "#dc2626";
  }

  copyTimeout = setTimeout(() => {
    copyStatus.textContent = "";
    copyBotao.textContent = "Copiar";
  }, 2500);
}

lengthInput.addEventListener("input", () => {
  gerarSenha();
});

optionInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    const totalSelecionados = optionInputs.filter((item) => item.checked).length;
    if (totalSelecionados === 0) {
      event.target.checked = true;
      copyStatus.textContent = "Selecione pelo menos um tipo de caractere!";
      copyStatus.style.color = "#dc2626";
      setTimeout(() => {
        if (copyStatus.textContent === "Selecione pelo menos um tipo de caractere!") {
          copyStatus.textContent = "";
        }
      }, 2000);
      return;
    }
    gerarSenha();
  });
});

formc.addEventListener("submit", (event) => {
  event.preventDefault();
  gerarSenha();
});

copyBotao.addEventListener("click", copiarSenha);

gerarSenha();