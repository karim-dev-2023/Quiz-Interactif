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
let questionStats = [];
let totalTime = 0;

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

const difficultyIndicator = getElement("#difficulty-indicator");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
themeSelect.addEventListener("change", (e) => {
  currentTheme = e.target.value;
});

setText(bestScoreValue, bestScore);

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;
  questions = questionsByTheme[currentTheme];
  questionStats = [];
  totalTime = 0;

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  updateDifficultyIndicator(q.difficulty);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");

  timeLeftSpan.textContent = q.timeLimit;
  q.startTime = Date.now();
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      const timeTaken = (Date.now() - q.startTime) / 1000;
      questionStats.push({ 
        question: q.text, 
        correct: false, 
        timeTaken: timeTaken 
      });
      totalTime += timeTaken;
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function updateDifficultyIndicator(difficulty) {
  difficultyIndicator.textContent = `Difficulté : ${difficulty}`;
  
  difficultyIndicator.className = "";
  difficultyIndicator.classList.add("difficulty", difficulty.toLowerCase());
}

function selectAnswer(index, btn) {
  clearInterval(timerId);
  const timeTaken = (Date.now() - questions[currentQuestionIndex].startTime) / 1000;

  const q = questions[currentQuestionIndex];
  const isCorrect = index === q.correct;

  questionStats.push({ 
    question: q.text, 
    correct: isCorrect, 
    timeTaken: timeTaken 
  });
  totalTime += timeTaken;

  if (isCorrect) {
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
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, questions.length);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);

  const encouragement = getEncouragement(score, questions.length);
  
  // Modification ici
  const emojiContainer = getElement("#encouragement-container");
  emojiContainer.innerHTML = `
    <h3 id="encouragement-title">${encouragement.title}</h3>
    <p id="encouragement">${encouragement.message}</p>
    <div class="emoji">${encouragement.emoji}</div>
  `;

  displayDetailedStats();
}

function displayDetailedStats() {
  const averageTime = totalTime / questions.length;
  setText(getElement("#average-time"), averageTime.toFixed(2));

  const statsContainer = getElement("#question-stats");
  statsContainer.innerHTML = "";

  questionStats.forEach((stat, index) => {
    const statElement = document.createElement("div");
    statElement.classList.add("question-stat");
    statElement.innerHTML = `
      <p>Question ${index + 1}: ${stat.correct ? "Correcte" : "Incorrecte"}</p>
      <p>Temps: ${stat.timeTaken.toFixed(2)} secondes</p>
    `;
    statsContainer.appendChild(statElement);
  });
}

function getEncouragement(score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100;
  const encouragementData = {
    title: "",
    message: "",
    emoji: ""
  };

  if (percentage === 100) {
    encouragementData.title = "Score Parfait 🏆";
    encouragementData.message = "Félicitations ! Vous avez répondu parfaitement à toutes les questions. Votre expertise est impressionnante !";
    encouragementData.emoji = "🌟🎉";
  } else if (percentage >= 80) {
    encouragementData.title = "Excellent Travail ! 👏";
    encouragementData.message = "Vous avez démontré une compréhension remarquable du sujet. Continuez sur cette voie !";
    encouragementData.emoji = "🚀";
  } else if (percentage >= 60) {
    encouragementData.title = "Bon Résultat 👍";
    encouragementData.message = "Vous avez bien performé. Avec un peu plus de pratique, vous deviendrez un expert !";
    encouragementData.emoji = "📈";
  } else if (percentage >= 40) {
    encouragementData.title = "Pas Mal ! 🤔";
    encouragementData.message = "Vous avez fait des progrès. Concentrez-vous sur vos points faibles pour vous améliorer.";
    encouragementData.emoji = "💡";
  } else {
    encouragementData.title = "Continuez à Apprendre ! 💪";
    encouragementData.message = "Chaque erreur est une opportunité d'apprentissage. Ne vous découragez pas et persévérez !";
    encouragementData.emoji = "🌱";
  }

  return encouragementData;
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  setText(bestScoreValue, bestScore);
}