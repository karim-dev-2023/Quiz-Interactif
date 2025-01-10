// quiz.js
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
  shuffleArray, // Import de la fonction shuffleArray
} from "./utils.js";

console.log("Quiz JS loaded...");

const questionsByTheme = {
  general: [
    {
      text: "Quelle est la capitale de la France ?",
      answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
      correct: 1,
      timeLimit: 10,
      difficulty: "facile"
    },
    {
      text: "Quel est le plus grand océan du monde ?",
      answers: ["Atlantique", "Indien", "Arctique", "Pacifique"],
      correct: 3,
      timeLimit: 10,
      difficulty: "facile"
    },
    {
      text: "Qui a peint la Joconde ?",
      answers: ["Van Gogh", "Picasso", "Léonard de Vinci", "Monet"],
      correct: 2,
      timeLimit: 12,
      difficulty: "moyen"
    },
    {
      text: "En quelle année la Première Guerre mondiale a-t-elle commencé ?",
      answers: ["1914", "1912", "1916", "1918"],
      correct: 0,
      timeLimit: 12,
      difficulty: "moyen"
    },
    {
      text: "Quel est l'élément chimique dont le symbole est 'Au' ?",
      answers: ["Argent", "Aluminium", "Or", "Cuivre"],
      correct: 2,
      timeLimit: 15,
      difficulty: "difficile"
    },
    {
      text: "Qui a écrit 'Le Petit Prince' ?",
      answers: ["Victor Hugo", "Antoine de Saint-Exupéry", "Émile Zola", "Albert Camus"],
      correct: 1,
      timeLimit: 15,
      difficulty: "difficile"
    }
  ],
  maths: [
    {
      text: "Combien font 2 + 3 ?",
      answers: ["3", "4", "5", "1"],
      correct: 2,
      timeLimit: 5,
      difficulty: "facile"
    },
    {
      text: "Quelle est la racine carrée de 16 ?",
      answers: ["2", "4", "8", "16"],
      correct: 1,
      timeLimit: 8,
      difficulty: "facile"
    },
    {
      text: "Combien font 7 × 8 ?",
      answers: ["54", "55", "56", "58"],
      correct: 2,
      timeLimit: 10,
      difficulty: "moyen"
    },
    {
      text: "Quel est le résultat de 15 ÷ 3 ?",
      answers: ["3", "4", "5", "6"],
      correct: 2,
      timeLimit: 10,
      difficulty: "moyen"
    },
    {
      text: "Quel est le carré de 9 ?",
      answers: ["18", "27", "36", "81"],
      correct: 3,
      timeLimit: 12,
      difficulty: "difficile"
    },
    {
      text: "Si x² = 64, quelle est la valeur de x ?",
      answers: ["6", "8", "±8", "16"],
      correct: 2,
      timeLimit: 15,
      difficulty: "difficile"
    }
  ],
  webdev: [
    {
      text: "Que signifie HTML ?",
      answers: [
        "Hyper Text Markup Language", 
        "High Tech Modern Language", 
        "Home Tool Markup Language", 
        "Hyper Transfer Markup Language"
      ],
      correct: 0,
      timeLimit: 10,
      difficulty: "facile"
    },
    {
      text: "Quel langage est utilisé pour styliser les pages web ?",
      answers: ["Java", "Python", "CSS", "PHP"],
      correct: 2,
      timeLimit: 10,
      difficulty: "facile"
    },
    {
      text: "Qu'est-ce que JavaScript permet de faire principalement ?",
      answers: [
        "Styliser des pages web", 
        "Créer la structure des pages", 
        "Ajouter de l'interactivité", 
        "Gérer les serveurs"
      ],
      correct: 2,
      timeLimit: 12,
      difficulty: "moyen"
    },
    {
      text: "Que signifie l'acronyme DOM ?",
      answers: [
        "Document Object Model", 
        "Data Object Management", 
        "Digital Object Manipulation", 
        "Dynamic Object Method"
      ],
      correct: 0,
      timeLimit: 12,
      difficulty: "moyen"
    },
    {
      text: "Quel framework JavaScript est développé par Facebook ?",
      answers: ["Angular", "Vue.js", "React", "Svelte"],
      correct: 2,
      timeLimit: 15,
      difficulty: "difficile"
    },
    {
      text: "Quelle méthode HTTP est généralement utilisée pour envoyer des données à un serveur ?",
      answers: ["GET", "POST", "PUT", "DELETE"],
      correct: 1,
      timeLimit: 15,
      difficulty: "difficile"
    }
  ]
};

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let currentTheme = "general";
let questions = [];

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
const themeSelect = getElement("#theme-select");

const scoreText = getElement("#score-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");

// Bouton et icône pour le mode sombre
const darkModeToggle = getElement("#dark-mode-toggle");
const darkModeIcon = getElement("#dark-mode-icon");

const recapTable = getElement("#recapAfterQuiz");
const recapBodyTable = getElement("#bodyRecapAfterQuiz");

const difficultyIndicator = getElement("#difficulty-indicator");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
darkModeToggle.addEventListener("click", toggleDarkMode);
themeSelect.addEventListener("change", (e) => {
  currentTheme = e.target.value;
});

setText(bestScoreValue, bestScore);

// Fonction pour démarrer le quiz
function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;
  questions = questionsByTheme[currentTheme];

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

// Fonction pour afficher une question
function showQuestion() {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  // Mise à jour de l'indicateur de difficulté pour chaque question
  updateDifficultyIndicator(q.difficulty);

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

function updateDifficultyIndicator(difficulty) {
  difficultyIndicator.textContent = `Difficulté : ${difficulty}`;
  
  // Ajout de classes pour le style
  difficultyIndicator.className = ""; // Réinitialise les classes
  difficultyIndicator.classList.add("difficulty", difficulty.toLowerCase());
}

// Fonction pour sélectionner une réponse
function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }
  q.answerUser = index;  

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

// Fonction pour passer à la question suivante
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

// Fonction pour terminer le quiz
function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, questions.length);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }

  showRecapAfterQuiz();
  setText(bestScoreEnd, bestScore);
}

// Fonction pour redémarrer le quiz
function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  if (recapBodyTable) {
    recapBodyTable.innerHTML = "";

    recapTable.style.display = "none";
  }

  setText(bestScoreValue, bestScore);
}

function showRecapAfterQuiz() {

  questions.forEach((question) => {
    const newTr = document.createElement("tr");

    const questionTd = document.createElement("td");
    questionTd.textContent = question.text;

    const userAnswerTd = document.createElement("td");
    if (question.answerUser !== null) {
      userAnswerTd.textContent = question.answers[question.answerUser];
    } else {
      userAnswerTd.textContent = "Pas de réponse";
    }

    const correctAnswerTd = document.createElement("td");
    correctAnswerTd.textContent = question.answers[question.correct];

    newTr.appendChild(questionTd);
    newTr.appendChild(userAnswerTd);
    newTr.appendChild(correctAnswerTd);

    recapBodyTable.appendChild(newTr);
  });

  recapTable.style.removeProperty("display");
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Ajoute une transition pour le fondu
  const iconElement = darkModeIcon;
  iconElement.classList.add("fade");

  if (body.classList.contains("dark-mode")) {
    iconElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#ffda00" d="M18 12a6 6 0 1 1-12 0a6 6 0 0 1 12 0"/>
        <path fill="#ffda00" fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/>
      </svg>
    `;
  } else {
    iconElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#284d92" d="M20.958 15.325c.204-.486-.379-.9-.868-.684a7.7 7.7 0 0 1-3.101.648c-4.185 0-7.577-3.324-7.577-7.425a7.3 7.3 0 0 1 1.134-3.91c.284-.448-.057-1.068-.577-.936C5.96 4.041 3 7.613 3 11.862C3 16.909 7.175 21 12.326 21c3.9 0 7.24-2.345 8.632-5.675"/>
        <path fill="#284d92" d="M15.611 3.103c-.53-.354-1.162.278-.809.808l.63.945a2.33 2.33 0 0 1 0 2.588l-.63.945c-.353.53.28 1.162.81.808l.944-.63a2.33 2.33 0 0 1 2.588 0l.945.63c.53.354 1.162-.278.808-.808l-.63-.945a2.33 2.33 0 0 1 0-2.588l.63-.945c.354-.53-.278-1.162-.809-.808l-.944.63a2.33 2.33 0 0 1-2.588 0z"/>
      </svg>
    `;
  }

  setTimeout(() => {
    iconElement.classList.remove("fade");
  }, 300);

  const isDarkMode = body.classList.contains("dark-mode");
  saveToLocalStorage("darkMode", isDarkMode);
}
