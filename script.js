const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%&*?+-_=."
};

const passwordInput = document.querySelector("#password");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");
const form = document.querySelector("#settingsForm");
const lengthInput = document.querySelector("#length");
const lengthValue = document.querySelector("#lengthValue");
const strengthLabel = document.querySelector("#strengthLabel");
const strengthBar = document.querySelector("#strengthBar");
const optionInputs = [...document.querySelectorAll(".option input")];

function randomIndex(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

function shuffle(text) {
  const chars = [...text];

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join("");
}

function getSelectedSets() {
  return optionInputs
    .filter((input) => input.checked)
    .map((input) => characterSets[input.id]);
}

function estimateStrength(length, selectedCount) {
  const score = length + selectedCount * 5;

  if (score >= 34) {
    return { label: "Muito forte", width: "100%", color: "#157f55" };
  }

  if (score >= 25) {
    return { label: "Forte", width: "76%", color: "#278b8e" };
  }

  if (score >= 17) {
    return { label: "Media", width: "52%", color: "#bf7a18" };
  }

  return { label: "Fraca", width: "28%", color: "#bd3d3d" };
}

function updateStrength() {
  const selectedSets = getSelectedSets();
  const strength = estimateStrength(Number(lengthInput.value), selectedSets.length);

  strengthLabel.textContent = strength.label;
  strengthBar.style.width = strength.width;
  strengthBar.style.background = strength.color;
}

function generatePassword() {
  const selectedSets = getSelectedSets();
  const length = Number(lengthInput.value);

  if (selectedSets.length === 0) {
    optionInputs[0].checked = true;
    selectedSets.push(characterSets[optionInputs[0].id]);
  }

  const allCharacters = selectedSets.join("");
  const requiredCharacters = selectedSets.map((set) => set[randomIndex(set.length)]);
  const remainingLength = Math.max(0, length - requiredCharacters.length);
  const randomCharacters = Array.from({ length: remainingLength }, () => {
    return allCharacters[randomIndex(allCharacters.length)];
  });

  passwordInput.value = shuffle([...requiredCharacters, ...randomCharacters].join(""));
  copyStatus.textContent = "";
  updateStrength();
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(passwordInput.value);
    copyStatus.textContent = "Senha copiada.";
  } catch {
    passwordInput.select();
    document.execCommand("copy");
    copyStatus.textContent = "Senha copiada.";
  }
}

lengthInput.addEventListener("input", () => {
  lengthValue.value = lengthInput.value;
  generatePassword();
});

optionInputs.forEach((input) => {
  input.addEventListener("change", generatePassword);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generatePassword();
});

copyButton.addEventListener("click", copyPassword);

generatePassword();
