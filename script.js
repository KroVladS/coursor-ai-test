let display = document.getElementById("display");
let currentInput = "";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

function appendNumber(number) {
  if (waitingForSecondOperand) {
    display.value = number;
    waitingForSecondOperand = false;
  } else {
    display.value = display.value === "0" ? number : display.value + number;
  }
  currentInput = display.value;
}

function appendOperator(op) {
  if (operator && !waitingForSecondOperand) {
    calculate();
  }
  firstOperand = parseFloat(display.value);
  operator = op;
  waitingForSecondOperand = true;
}

function calculate() {
  if (operator === null || waitingForSecondOperand) {
    return;
  }

  let secondOperand = parseFloat(currentInput);
  let result = 0;

  switch (operator) {
    case "+":
      result = firstOperand + secondOperand;
      break;
    case "-":
      result = firstOperand - secondOperand;
      break;
    case "*":
      result = firstOperand * secondOperand;
      break;
    case "/":
      if (secondOperand === 0) {
        display.value = "Ошибка";
        return;
      }
      result = firstOperand / secondOperand;
      break;
  }

  display.value = result;
  firstOperand = result;
  operator = null;
  waitingForSecondOperand = true;
}

function clearDisplay() {
  display.value = "";
  currentInput = "";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
}
