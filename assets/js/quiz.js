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

const questions = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
    answerUser: null,
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
    answerUser: null,
  },
];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

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

const recapTable = getElement("#recapAfterQuiz");
const recapBodyTable = getElement("#bodyRecapAfterQuiz");

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
  q.answerUser = index;

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
  showRecapAfterQuiz();
  setText(bestScoreEnd, bestScore);
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  if (recapBodyTable) {
    recapBodyTable.innerHTML = "";

    recapTable.style.display = "none";
  }

  setText(bestScoreValue, bestScore);
}

function showRecapAfterQuiz(question) {

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
