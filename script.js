let display = document.getElementById('display');
let historyDiv = document.getElementById('history');
let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let lastOperator = null;
let lastOperand = null;

// Загрузка истории из localStorage
let calculations = JSON.parse(localStorage.getItem('calcHistory')) || [];

// В начало файла добавим обновленные функции для работы с темой

const getStoredTheme = () => localStorage.getItem('calculator-theme');
const setStoredTheme = theme => localStorage.setItem('calculator-theme', theme);

const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const setTheme = theme => {
    const themeSwitcher = document.querySelector('#bd-theme');
    const themeIcon = document.querySelector('.theme-icon-active');
    
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }

    // Обновляем иконку
    const icons = {
        light: 'bi-sun-fill',
        dark: 'bi-moon-stars-fill',
        auto: 'bi-circle-half'
    };

    themeIcon.className = `bi ${icons[theme]} theme-icon-active`;

    // Обновляем активный элемент в меню
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
        element.classList.remove('active');
        element.querySelector('.bi-check2').classList.add('d-none');
        
        if (element.getAttribute('data-bs-theme-value') === theme) {
            element.classList.add('active');
            element.querySelector('.bi-check2').classList.remove('d-none');
        }
    });
};

// Инициализация темы
const initTheme = () => {
    setTheme(getPreferredTheme());

    // Добавляем слушатели для кнопок переключения темы
    document.querySelectorAll('[data-bs-theme-value]')
        .forEach(toggle => {
            toggle.addEventListener('click', () => {
                const theme = toggle.getAttribute('data-bs-theme-value');
                setStoredTheme(theme);
                setTheme(theme);
            });
        });

    // Слушатель изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
        }
    });
};

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(calculations));
}

function displayHistory() {
    historyDiv.innerHTML = calculations.map((calc, index) => 
        `<div class="history-item" onclick="useHistoryItem(${index})">
            ${calc.expression} = ${calc.result}
        </div>`
    ).join('');
}

function useHistoryItem(index) {
    const calc = calculations[index];
    display.value = calc.result;
    currentInput = calc.result;
    updateDisplay(calc.result);
}

function addRippleEffect(button) {
    button.querySelectorAll('.ripple').forEach(ripple => ripple.remove());
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = `${Math.max(button.offsetWidth, button.offsetHeight)}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function getButtonByKey(key) {
    let button = null;
    
    switch(key) {
        case 'Enter':
        case '=':
            button = document.querySelector('.btn-equals');
            break;
        case 'Escape':
        case 'Delete':
            button = document.querySelector('.btn-clear');
            break;
        case '*':
            button = document.querySelector('.btn-operator:nth-child(13)');
            break;
        case '/':
            button = document.querySelector('.btn-operator:last-child');
            break;
        case '+':
            button = document.querySelector('.btn-operator:nth-child(5)');
            break;
        case '-':
            button = document.querySelector('.btn-operator:nth-child(9)');
            break;
        default:
            if (/^[0-9.]$/.test(key)) {
                const buttons = document.querySelectorAll('.btn-number');
                for (let btn of buttons) {
                    if (btn.textContent === key) {
                        button = btn;
                        break;
                    }
                }
            }
    }
    return button;
}

function handleKeyPress(event) {
    // Предотвращаем стандартное поведение
    if (event.key === 'Enter' || event.key === '=' || 
        event.key === '+' || event.key === '-' || 
        event.key === '*' || event.key === '/' ||
        event.key === 'Backspace') {
        event.preventDefault();
    }

    // Обработка ввода
    if (/^[0-9.]$/.test(event.key)) {
        appendNumber(event.key);
    }
    else if (['+', '-', '*', '/'].includes(event.key)) {
        appendOperator(event.key);
    }
    else if (event.key === 'Enter' || event.key === '=') {
        calculate();
    }
    else if (event.key === 'Escape' || event.key === 'Delete') {
        clearDisplay();
    }
    else if (event.key === 'Backspace') {
        if (!waitingForSecondOperand && display.value.length > 0) {
            display.value = display.value.slice(0, -1);
            currentInput = display.value;
            if (display.value === '') {
                display.value = '0';
            }
        }
    }

    // Анимация кнопки
    const button = getButtonByKey(event.key);
    if (button) {
        button.classList.add('active');
        addRippleEffect(button);
        setTimeout(() => button.classList.remove('active'), 150);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем тему
    initTheme();

    // Добавляем обработчики для переключателей темы
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    });

    displayHistory();
    updateDisplay('0');

    document.querySelectorAll('.btn-number').forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.textContent);
            addRippleEffect(button);
        });
    });

    document.querySelectorAll('.btn-operator').forEach(button => {
        button.addEventListener('click', () => {
            const operatorMap = {
                '×': '*',
                '÷': '/'
            };
            let op = button.textContent;
            op = operatorMap[op] || op;
            appendOperator(op);
            addRippleEffect(button);
        });
    });

    document.querySelector('.btn-clear').addEventListener('click', () => {
        clearDisplay();
        addRippleEffect(document.querySelector('.btn-clear'));
    });
    
    document.querySelector('.btn-equals').addEventListener('click', () => {
        calculate();
        addRippleEffect(document.querySelector('.btn-equals'));
    });

    document.addEventListener('keydown', handleKeyPress);

    // Обработчик очистки истории
    document.getElementById('clear-history').addEventListener('click', function() {
        if (calculations.length > 0) {
            // Добавим подтверждение очистки
            if (confirm('Очистить историю вычислений?')) {
                calculations = [];
                saveHistory();
                displayHistory();
                addRippleEffect(this);
            }
        }
    });
});

function updateDisplay(value) {
    display.value = value === '' || value === undefined ? '0' : value;
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
        display.value = display.value === '0' && number !== '.' ? 
            number : 
            display.value + number;
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
    lastOperator = op;
    waitingForSecondOperand = true;
}

function calculate() {
    if (operator === null && lastOperator === null) {
        return;
    }

    let currentOperator = operator || lastOperator;
    let secondOperand;
    
    if (operator === null && lastOperator !== null) {
        secondOperand = lastOperand;
        firstOperand = parseFloat(display.value);
    } else {
        secondOperand = parseFloat(currentInput);
        lastOperator = operator;
        lastOperand = secondOperand;
    }

    let result = 0;
    let expression = `${firstOperand} ${currentOperator} ${secondOperand}`;

    switch (currentOperator) {
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

    calculations.unshift({
        expression: expression,
        result: result
    });

    if (calculations.length > 5) {
        calculations.pop();
    }

    saveHistory();
    displayHistory();
    updateDisplay(result);
    firstOperand = result;
    operator = null;
    waitingForSecondOperand = true;
}

function clearDisplay() {
    updateDisplay('0');
    currentInput = '0';
    firstOperand = null;
    operator = null;
    lastOperator = null;
    lastOperand = null;
    waitingForSecondOperand = false;
}
