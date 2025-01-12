// Поиск элементов DOM
const display = document.getElementById('display');
const historyDiv = document.getElementById('history');
const btnEquals = document.getElementById('btn-equals');
const btnClear = document.getElementById('btn-clear');
const btnAdd = document.getElementById('btn-add');
const btnSubtract = document.getElementById('btn-subtract');
const btnMultiply = document.getElementById('btn-multiply');
const btnDivide = document.getElementById('btn-divide');
const numberBtn = document.querySelectorAll('.btn-number');
const operatorBtn = document.querySelectorAll('.btn-operator');
const clearHistoryBtn = document.getElementById('clear-history');
const themeSwitcher = document.getElementById('bd-theme');

// Остальные переменные состояния
let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let lastOperator = null;
let lastOperand = null;

// Загрузка истории из localStorage
const storage = {
    get: (key, defaultValue = []) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
};

let calculations = storage.get('calcHistory');

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
    const themeIcon = themeSwitcher.querySelector('.theme-icon-active');
    
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
    ['theme-light', 'theme-dark', 'theme-auto'].forEach(id => {
        const element = document.getElementById(id);
        const checkIcon = element.querySelector('.bi-check2');
        element.classList.remove('active');
        checkIcon.classList.add('d-none');
        
        if (id === `theme-${theme}`) {
            element.classList.add('active');
            checkIcon.classList.remove('d-none');
        }
    });
};

// Инициализация темы
const initTheme = () => {
    setTheme(getPreferredTheme());

    // Добавляем слушатели для кнопок переключения темы
    ['theme-light', 'theme-dark', 'theme-auto'].forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            const theme = id.replace('theme-', '');
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
            button = btnEquals;
            break;
        case 'Escape':
        case 'Delete':
            button = btnClear;
            break;
        case '*':
            button = btnMultiply;
            break;
        case '/':
            button = btnDivide;
            break;
        case '+':
            button = btnAdd;
            break;
        case '-':
            button = btnSubtract;
            break;
        default:
            if (/^[0-9.]$/.test(key)) {
                for (let btn of numberBtn) {
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
    
    displayHistory();
    updateDisplay('0');

    // Обработчики для цифровых кнопок
    numberBtn.forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.textContent);
            addRippleEffect(button);
        });
    });

    // Обработчики для кнопок операторов
    operatorBtn.forEach(button => {
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

    // Обработчик для кнопки очистки
    btnClear.addEventListener('click', () => {
        clearDisplay();
        addRippleEffect(btnClear);
    });
    
    // Обработчик для кнопки равно
    btnEquals.addEventListener('click', () => {
        calculate();
        addRippleEffect(btnEquals);
    });

    // Обработчик клавиатуры
    document.addEventListener('keydown', handleKeyPress);

    // Обработчик очистки истории
    clearHistoryBtn.addEventListener('click', function() {
        if (calculations.length > 0) {
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
    const displayValue = value === '' || value === undefined ? '0' : value;
    if (display.value !== displayValue) {
        display.value = displayValue;
        display.classList.toggle('text-danger', parseFloat(value) < 0);
    }
}

function appendNumber(number) {
    
    if (waitingForSecondOperand) {
        currentInput = number;
        waitingForSecondOperand = false;
    } else {
        currentInput = currentInput === '0' && number !== '.' ? 
            number : 
            currentInput + number;
    }
    updateDisplay(currentInput);
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
    if (operator === null && lastOperator === null) return;

    const currentOperator = operator || lastOperator;
    const secondOperand = operator === null ? lastOperand : parseFloat(currentInput);
    lastOperand = secondOperand;
    
    if (operator === null) {
        firstOperand = parseFloat(display.value);
    }

    const expression = `${firstOperand} ${currentOperator} ${secondOperand}`;
    const result = operators[currentOperator](firstOperand, secondOperand);
    
    if (result === 'Ошибка. Деление на ноль невозможно') {
        display.value = result;
        return;
    }

    // Добавление в историю
    calculations.unshift({ expression, result });
    if (calculations.length > 50) calculations.pop();

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

const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => b !== 0 ? a / b : 'Ошибка. Деление на ноль невозможно'
};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSaveHistory = debounce(() => {
    storage.set('calcHistory', calculations);
}, 300);
