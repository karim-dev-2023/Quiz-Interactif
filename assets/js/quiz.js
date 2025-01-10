import {
  getElement,
  showElement,
  hideElement,
  setText,
  createAnswerButton,
  updateScoreDisplay,
  lockAnswers,
  markCorrectAnswer,
} from "./dom.js";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  startTimer,
  shuffleArray, 
} from "./utils.js";
import { translations } from "./translation.js"; 

console.log("Quiz JS loaded...");

// État initial des variables
let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let currentLanguage = "fr"; // Langue par défaut

const questions = {
  fr: [
    {
      text: "Quelle est la capitale de la France ?",
      answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "Combien font 2 + 3 ?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  en: [
    {
      text: "What is the capital of France?",
      answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "What is 2 + 3?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  es: [
    {
      text: "¿Cuál es la capital de Francia?",
      answers: ["Marsella", "París", "Lyon", "Burdeos"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "¿Cuánto es 2 + 3?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  ar: [
    {
      text: "ما هي عاصمة فرنسا؟",
      answers: ["مرسيليا", "باريس", "ليون", "بوردو"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "كم يساوي ٢ + ٣؟",
      answers: ["٣", "٤", "٥", "١"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  it: [
    {
      text: "Qual è la capitale della Francia?",
      answers: ["Marsiglia", "Parigi", "Lione", "Bordeaux"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "Quanto fa 2 + 3?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  de: [
    {
      text: "Was ist die Hauptstadt von Frankreich?",
      answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "Wie viel ist 2 + 3?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  ja: [
    {
      text: "フランスの首都はどこですか？",
      answers: ["マルセイユ", "パリ", "リヨン", "ボルドー"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "2 + 3 はいくつですか？",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
  ko: [
    {
      text: "프랑스의 수도는 어디입니까?",
      answers: ["마르세유", "파리", "리옹", "보르도"],
      correct: 1,
      timeLimit: 10,
    },
    {
      text: "2 + 3은 얼마입니까?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
    },
  ],
};


// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");

const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");

const questionText = getElement("#question-text");
const answersDiv = getElement("#answers");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const restartBtn = getElement("#restart-btn");

const scoreText = getElement("#score-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");

// Sélecteur de langue
const languageSelector = getElement("#language");
const introMessage = getElement(".notice");
const resultTitle = getElement("#result-screen h2");
const timerLabel = getElement("#timer-div");

// Fonction pour obtenir les questions dans la langue actuelle
function getQuestions() {
  const questionsForLang = questions[currentLanguage];
  if (!questionsForLang) {
    alert(`Les questions ne sont pas encore disponibles pour la langue : ${currentLanguage}`);
    return questions["fr"]; // Par défaut, retourner les questions en français
  }
  return questionsForLang;
}


function updateLanguageTexts() {
  const lang = translations[currentLanguage];

  // Mise à jour des textes statiques
  setText(introMessage, lang.introMessage);
  setText(startBtn, lang.startButton);
  setText(nextBtn, lang.nextButton);
  setText(restartBtn, lang.restartButton);
  setText(resultTitle, lang.resultTitle);

  // Mise à jour du texte "Temps restant"
  const timerLabel = document.querySelector("#timer-div");
  if (timerLabel) {
    timerLabel.firstChild.textContent = `${lang.timer} `;
  }

  // Mise à jour du meilleur score avant le départ
  const bestScoreText = document.querySelector("#best-score-text");
  if (bestScoreText) {
    bestScoreText.textContent = `${lang.bestScore} ${bestScore}`;
  }

  // Mise à jour du label "Meilleur score" à la fin du quiz
  const bestScoreLabel = document.querySelector("#best-score-end");
  if (bestScoreLabel) {
    bestScoreLabel.textContent = `${lang.bestScore} ${bestScore}`;
  }
}




// pour changer la langue
languageSelector.addEventListener("change", (event) => {
  currentLanguage = event.target.value;
  updateLanguageTexts();
});

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

setText(bestScoreValue, bestScore);
updateLanguageTexts(); 

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  // Désactiver le sélecteur de langue
  languageSelector.disabled = true;

  // Mélanger les questions dans la langue actuelle
  shuffleArray(getQuestions());

  setText(totalQuestionsSpan, getQuestions().length);

  showQuestion();
}


function showQuestion() {
  clearInterval(timerId);

  const q = getQuestions()[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");

  timeLeftSpan.textContent = q.timeLimit;
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = getQuestions()[currentQuestionIndex];
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < getQuestions().length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  const lang = translations[currentLanguage]; 

  // Mettre à jour le texte du score final
  updateScoreDisplay(scoreText, score, getQuestions().length, lang.currentScore, lang.bestScore);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }

  // Mise à jour du meilleur score à la fin du quiz
  const bestScoreLabel = document.querySelector("#best-score-end");
  if (bestScoreLabel) {
    bestScoreLabel.textContent = `${lang.bestScore} ${bestScore}`;
  }
}


function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;

  // Réinitialiser le meilleur score affiché
  const lang = translations[currentLanguage];
  const bestScoreText = document.querySelector("#best-score-text");
  if (bestScoreText) {
    bestScoreText.textContent = `${lang.bestScore} ${bestScore}`;
  }

  hideElement(resultScreen);
  showElement(introScreen);
  languageSelector.disabled = false;

  setText(bestScoreValue, bestScore);
  updateLanguageTexts();
}

