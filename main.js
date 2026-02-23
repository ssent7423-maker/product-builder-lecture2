document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const display = document.getElementById('calc-display');
  const history = document.getElementById('calc-history');
  const keys = document.querySelector('.calc-keys');
  let expression = '';
  let justEvaluated = false;

  // Load theme preference from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = 'Light Mode';
    } else {
      body.removeAttribute('data-theme');
      themeToggle.textContent = 'Dark Mode';
    }
    localStorage.setItem('theme', theme);
  }

  function updateDisplay(value) {
    display.value = value || '0';
  }

  function updateHistory(value) {
    history.textContent = value || '';
  }

  function sanitizeExpression(value) {
    return value.replace(/[^0-9.+\-*/()]/g, '');
  }

  function formatExpression(value) {
    return value
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−');
  }

  function appendValue(value) {
    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
    }

    if (value === '.') {
      const lastNumber = expression.split(/[+\-*/]/).pop();
      if (lastNumber.includes('.')) {
        return;
      }
      if (lastNumber === '') {
        expression += '0';
      }
    }

    expression += value;
    updateDisplay(expression);
    updateHistory(formatExpression(expression));
  }

  function replaceOperator(value) {
    if (expression === '') {
      if (value === '-') {
        expression = value;
      }
      updateDisplay(expression);
      updateHistory(formatExpression(expression));
      return;
    }

    if (/[+\-*/]$/.test(expression)) {
      expression = expression.replace(/[+\-*/]$/, value);
    } else {
      expression += value;
    }
    updateDisplay(expression);
    updateHistory(formatExpression(expression));
  }

  function applyPercent() {
    if (expression === '') {
      return;
    }
    const match = expression.match(/(\d+(\.\d+)?)$/);
    if (!match) {
      return;
    }
    const number = parseFloat(match[1]);
    const percentValue = (number / 100).toString();
    expression = expression.replace(/(\d+(\.\d+)?)$/, percentValue);
    updateDisplay(expression);
    updateHistory(formatExpression(expression));
  }

  function clearAll() {
    expression = '';
    justEvaluated = false;
    updateDisplay('0');
    updateHistory('');
  }

  function deleteLast() {
    if (justEvaluated) {
      clearAll();
      return;
    }
    expression = expression.slice(0, -1);
    updateDisplay(expression);
    updateHistory(formatExpression(expression));
  }

  function evaluateExpression() {
    if (expression === '') {
      return;
    }
    const safeExpression = sanitizeExpression(expression);
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`return ${safeExpression}`)();
      if (Number.isFinite(result)) {
        updateHistory(`${formatExpression(expression)} =`);
        expression = result.toString();
        updateDisplay(expression);
        justEvaluated = true;
      } else {
        updateDisplay('Error');
        justEvaluated = true;
      }
    } catch {
      updateDisplay('Error');
      justEvaluated = true;
    }
  }

  if (keys) {
    keys.addEventListener('click', (event) => {
      const key = event.target.closest('button');
      if (!key) return;

      const action = key.dataset.action;
      const value = key.dataset.value;

      if (action === 'clear') {
        clearAll();
        return;
      }

      if (action === 'delete') {
        deleteLast();
        return;
      }

      if (action === 'percent') {
        applyPercent();
        return;
      }

      if (action === 'equals') {
        evaluateExpression();
        return;
      }

      if (value && /[+\-*/]/.test(value)) {
        replaceOperator(value);
        return;
      }

      if (value) {
        appendValue(value);
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    const { key } = event;
    if (/[0-9]/.test(key)) {
      appendValue(key);
      return;
    }
    if (key === '.') {
      appendValue(key);
      return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      replaceOperator(key);
      return;
    }
    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      evaluateExpression();
      return;
    }
    if (key === 'Backspace') {
      deleteLast();
      return;
    }
    if (key === 'Escape') {
      clearAll();
    }
  });
});
