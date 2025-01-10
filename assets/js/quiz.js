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

console.log("Quiz JS loaded...");

const questions = [
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
];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

// Badges
const badges = [
  { name: "Novice", criteria: 1, unlocked: false },
  { name: "Expert", criteria: 5, unlocked: false },
  { name: "Maître", criteria: 10, unlocked: false },
];

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");
const badgesScreen = getElement("#badges-screen");

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

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

setText(bestScoreValue, bestScore);

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  // Mélanger les questions
  shuffleArray(questions);

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
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

  const q = questions[currentQuestionIndex];

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

// Vérification des badges
checkBadges(score);

// Afficher les badges
displayBadges();
}

function checkBadges(score) {
badges.forEach(badge => {
if (score >= badge.criteria && !badge.unlocked) {
badge.unlocked = true;
}
});
}

function displayBadges() {
const badgesList = getElement("#badges-list");
badgesList.innerHTML = "";

badges.forEach(badge => {
if (badge.unlocked) {
const li = document.createElement("li");
li.textContent = badge.name;
badgesList.appendChild(li);
}
});
showElement(badgesScreen);
// Lancer les confettis sur toute la page
launchConfetti();
setTimeout(() => {
   hideElement(badgesScreen); // Masquer les badges après un délai
},5000);

// Effacer les confettis après un certain temps
setTimeout(() => {
   confetti.reset();
},6000);
}

function launchConfetti() {
   confetti({
       particleCount:100,
       spread:160,
       origin:{ y:0.6 }
   });
}

function restartQuiz() {
hideElement(resultScreen);
showElement(introScreen);

setText(bestScoreValue, bestScore);
}
