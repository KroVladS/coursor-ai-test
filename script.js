let display = document.getElementById('display');
let historyDiv = document.getElementById('history');
let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Загрузка истории из localStorage
let calculations = JSON.parse(localStorage.getItem('calcHistory')) || [];

// Функция для сохранения истории
function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(calculations));
}

// Функция для отображения истории
function displayHistory() {
    historyDiv.innerHTML = calculations.map((calc, index) => 
        `<div class="history-item" onclick="useHistoryItem(${index})">
            ${calc.expression} = ${calc.result}
        </div>`
    ).join('');
}

// Функция для использования элемента истории
function useHistoryItem(index) {
    const calc = calculations[index];
    display.value = calc.result;
    currentInput = calc.result;
    updateDisplay(calc.result);
}

// Очистка истории
document.getElementById('clearHistory').addEventListener('click', () => {
    calculations = [];
    saveHistory();
    displayHistory();
});

// Добавляем обработчики событий для всех кнопок
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем историю при загрузке
    displayHistory();

    // Для цифр
    document.querySelectorAll('.btn-number').forEach(button => {
        button.addEventListener('click', () => appendNumber(button.textContent));
    });

    // Для операторов
    document.querySelectorAll('.btn-operator').forEach(button => {
        button.addEventListener('click', () => {
            const operatorMap = {
                '×': '*',
                '÷': '/'
            };
            let op = button.textContent;
            // Преобразуем символы в операторы
            op = operatorMap[op] || op;
            appendOperator(op);
        });
    });

    // Для кнопки очистки
    document.querySelector('.btn-clear').addEventListener('click', clearDisplay);

    // Для кнопки равно
    document.querySelector('.btn-equals').addEventListener('click', calculate);
});

function updateDisplay(value) {
    display.value = value;
    if (parseFloat(value) < 0) {
        display.classList.add('negative');
    } else {
        display.classList.remove('negative');
    }
}

function appendNumber(number) {
    if (waitingForSecondOperand) {
        display.value = number;
        waitingForSecondOperand = false;
    } else {
        display.value = display.value === '0' ? number : display.value + number;
    }
    currentInput = display.value;
    updateDisplay(display.value);
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
    let expression = `${firstOperand} ${operator} ${secondOperand}`;

    switch (operator) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            if (secondOperand === 0) {
                display.value = 'Ошибка';
                return;
            }
            result = firstOperand / secondOperand;
            break;
    }

    // Добавляем вычисление в историю
    calculations.unshift({
        expression: expression,
        result: result
    });

    // Ограничиваем историю 10 последними вычислениями
    if (calculations.length > 10) {
        calculations.pop();
    }

    // Сохраняем и отображаем обновленную историю
    saveHistory();
    displayHistory();

    updateDisplay(result);
    firstOperand = result;
    operator = null;
    waitingForSecondOperand = true;
}

function clearDisplay() {
    updateDisplay('');
    currentInput = '';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}
