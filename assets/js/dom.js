// dom.js
export const getElement = (selector) => document.querySelector(selector);
export const showElement = (element) => (element.style.display = "block");
export const hideElement = (element) => (element.style.display = "none");
export const setText = (element, text) => (element.textContent = text);

export const createAnswerButton = (text, onClick) => {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
};

export const updateScoreDisplay = (scoreElement, score, total, currentScoreText, bestScoreText) => {
  // Mettre à jour "Votre score"
  scoreElement.textContent = `${currentScoreText} ${score} / ${total}`;

  // Mettre à jour "Meilleur score"
  const bestScoreLabel = document.querySelector("#best-score-end");
  if (bestScoreLabel) {
    const bestScore = localStorage.getItem("bestScore") || 0;
    bestScoreLabel.textContent = `${bestScoreText} ${bestScore}`;
  }
};


function restartQuiz() {
  // Réinitialiser les variables
  currentQuestionIndex = 0;
  score = 0;

  // Cacher l'écran des résultats et afficher l'écran d'intro
  hideElement(resultScreen);
  showElement(introScreen);

  // Mettre à jour le meilleur score avant le départ dans la langue sélectionnée
  const lang = translations[currentLanguage];
  const bestScoreText = document.querySelector("#best-score-text");
  if (bestScoreText) {
    bestScoreText.textContent = `${lang.bestScore} ${bestScore}`;
  }

  // Réinitialiser les textes et l'état de l'écran d'intro
  setText(bestScoreValue, bestScore);
  updateLanguageTexts();
}

export const lockAnswers = (container) => {
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));
};

export const markCorrectAnswer = (container, correctIndex) => {
  const buttons = container.querySelectorAll("button");
  if (buttons[correctIndex]) {
    buttons[correctIndex].classList.add("correct");
  }
};
