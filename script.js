// Гамбургер меню
const hamburger = document.getElementById('hamburger');
const menuLinks = document.querySelector('.menu-links');

hamburger.addEventListener('click', function() {
    menuLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.menu-links a').forEach(link => {
    link.addEventListener('click', function() {
        menuLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Плавная прокрутка для меню
document.querySelectorAll('.fixed-menu a, .scroll-down, .logo, .btn[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Управление высотой меню при скролле
let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', function() {
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

// Если меню открыто, закрываем его при скролле
if (menuLinks.classList.contains('active')) {
menuLinks.classList.remove('active');
hamburger.classList.remove('active');
}

lastScrollTop = scrollTop;
});

// Закрытие меню при клике вне его области
document.addEventListener('click', function(event) {
const isClickInsideMenu = menuLinks.contains(event.target) || hamburger.contains(event.target);

if (!isClickInsideMenu && menuLinks.classList.contains('active')) {
menuLinks.classList.remove('active');
hamburger.classList.remove('active');
}
});

// Обработка формы
document.getElementById('guest-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Здесь должна быть отправка данных в Google Sheets
    // Для демонстрации просто показываем сообщение
    alert('Спасибо за подтверждение! Мы добавили вас в список гостей.');
    this.reset();
});

// Добавление полей для дополнительных гостей
document.getElementById('guests-count').addEventListener('change', function() {
    const guestsCount = parseInt(this.value);
    const container = document.getElementById('additional-guests');

    container.innerHTML = '';

    if (guestsCount > 1) {
        container.style.display = 'block';

        for (let i = 2; i <= guestsCount; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="guest${i}">Имя и Фамилия гостя ${i}:</label>
                <input type="text" id="guest${i}" name="guest${i}">
            `;
            container.appendChild(div);
        }
    } else {
        container.style.display = 'none';
    }
});

// Обработка формы
document.getElementById('guest-form').addEventListener('submit', async function(e) {
e.preventDefault();

// Собираем данные из формы
const formData = {
name: document.getElementById('name').value,
guests_count: document.getElementById('guests-count').value,
drinks: getSelectedOptions('drinks'),
stay: document.getElementById('stay').value,
car: document.getElementById('car').value,
track: document.getElementById('track').value,
phone: document.getElementById('phone').value
};

// Собираем дополнительные имена гостей
const additionalGuests = [];
const guestInputs = document.querySelectorAll('#additional-guests input');
guestInputs.forEach(input => {
if (input.value.trim()) {
    additionalGuests.push(input.value.trim());
}
});

if (additionalGuests.length > 0) {
formData.additional_guests = additionalGuests;
}

// Показываем сообщение о загрузке
const submitBtn = this.querySelector('button[type="submit"]');
const originalText = submitBtn.textContent;
submitBtn.textContent = 'Отправка...';
submitBtn.disabled = true;

try {
// Отправляем данные на Google Apps Script
const response = await fetch('https://script.google.com/macros/s/AKfycbxgMEbBrT_Yc5_5Fan6Y0Qiwf0iVE3Fr-dwNIrlCC2lWCWui0YLxx24C3PJL8ZSxNDY/exec', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
});

const result = await response.json();

if (result.success) {
    // Успешная отправка
    showMessage('✅ Спасибо за подтверждение! Мы добавили вас в список гостей.', 'success');
    this.reset();
    
    // Скрываем дополнительные поля гостей
    document.getElementById('additional-guests').style.display = 'none';
    document.getElementById('additional-guests').innerHTML = '';
} else {
    // Ошибка сервера
    showMessage('❌ Ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'error');
    console.error('Ошибка сервера:', result.message);
}

} catch (error) {
// Ошибка сети
showMessage('❌ Ошибка соединения. Проверьте интернет и попробуйте еще раз.', 'error');
console.error('Ошибка сети:', error);
} finally {
// Восстанавливаем кнопку
submitBtn.textContent = originalText;
submitBtn.disabled = false;
}
});

// Функция для получения выбранных опций в мультиселекте
function getSelectedOptions(selectId) {
const select = document.getElementById(selectId);
if (!select) return [];

const selected = [];
for (let i = 0; i < select.options.length; i++) {
if (select.options[i].selected) {
    selected.push(select.options[i].value);
}
}
return selected;
}

// Функция для показа сообщений
function showMessage(message, type = 'info') {
// Удаляем предыдущие сообщения
const existingMessage = document.querySelector('.form-message');
if (existingMessage) {
existingMessage.remove();
}

// Создаем новое сообщение
const messageDiv = document.createElement('div');
messageDiv.className = `form-message ${type}`;
messageDiv.textContent = message;
messageDiv.style.cssText = `
margin: 20px 0;
padding: 15px;
border-radius: ${getComputedStyle(document.documentElement).getPropertyValue('--border-radius')};
text-align: center;
font-weight: 500;
background-color: ${type === 'success' ? 'rgba(74, 108, 74, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
color: ${type === 'success' ? 'var(--primary-green)' : '#d32f2f'};
border: 1px solid ${type === 'success' ? 'var(--primary-green)' : '#d32f2f'};
`;

// Добавляем сообщение перед кнопкой отправки
const submitBtn = document.querySelector('#guest-form button[type="submit"]');
submitBtn.parentNode.insertBefore(messageDiv, submitBtn);

// Автоматически скрываем через 5 секунд
if (type === 'success') {
setTimeout(() => {
    if (messageDiv.parentNode) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 500);
    }
}, 5000);
}
}

// Инициализация карты
function initMap() {
    // Координаты поселка Ладыгино (приблизительные)
    const map = L.map('map').setView([54.8, 20.5], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Добавляем маркер
    L.marker([54.8, 20.5])
        .addTo(map)
        .bindPopup('Гостевой дом "Сосны, ели и залив"<br>пос. Ладыгино, Калининградская обл.')
        .openPopup();
}

// Таймер обратного отсчета
function updateCountdown() {
const targetDate = new Date('June 13, 2026 16:00:00 GMT+0300').getTime();
const now = new Date().getTime();
const timeLeft = targetDate - now;

if (timeLeft < 0) {
document.getElementById('days').textContent = '000';
document.getElementById('hours').textContent = '00';
document.getElementById('minutes').textContent = '00';
document.getElementById('seconds').textContent = '00';
return;
}

const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

document.getElementById('days').textContent = days.toString().padStart(3, '0');
document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Инициализация таймера и его периодическое обновление
document.addEventListener('DOMContentLoaded', function() {
// Запускаем сразу при загрузке
updateCountdown();

// Обновляем каждую секунду
setInterval(updateCountdown, 1000);

// Также вызываем после полной загрузки страницы
window.addEventListener('load', updateCountdown);
});


// ИГРА
// Находим элементы
const toggleGameBtn = document.getElementById('toggle-game-btn');
const gameContainer = document.getElementById('game-container');
const restartGameBtn = document.getElementById('restart-game');
const leaderboardContainer = document.getElementById('leaderboard-container');
const saveResultForm = document.getElementById('save-result-form');
const saveResultBtn = document.getElementById('save-result-btn');
const playerNameInput = document.getElementById('player-name');

let gameStarted = false;
let gameTimer = 0;
let gameInterval = null;
let moves = 0;
let pairsFound = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerRunning = false; // Флаг, что таймер запущен
let gameActive = false; // Флаг, что игра активна (первый ход сделан)

// Ключ для localStorage
const LEADERBOARD_KEY = 'wedding_memory_leaderboard';

// Обработчик кнопки "Сыграть в Memory"
toggleGameBtn.addEventListener('click', function() {
const isHidden = gameContainer.style.display === 'none' || gameContainer.style.display === '';

if (isHidden) {
// Показываем игру
gameContainer.style.display = 'block';
gameStarted = true;

// Инициализируем игру, если она еще не инициализирована
if (document.getElementById('memory-grid').children.length === 0) {
    initGame();
} else {
    // Если игра уже была инициализирована, просто показываем ее
    adjustGameForMobile();
}

// Загружаем турнирную таблицу
loadLeaderboard();

// НЕ запускаем таймер сразу, только показываем игру
// Таймер запустится при первом клике на карточку

// Меняем текст кнопки
toggleGameBtn.textContent = 'Скрыть игру';

// Плавная прокрутка к игре
setTimeout(() => {
    gameContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, 100);
} else {
// Скрываем игру
gameContainer.style.display = 'none';
gameStarted = false;

// Останавливаем таймер только если он был запущен
if (timerRunning) {
    clearInterval(gameInterval);
    timerRunning = false;
}

// Сбрасываем флаг активности игры
gameActive = false;

// Меняем текст кнопки
toggleGameBtn.textContent = 'Сыграть в Memory';
}
});

// Обработчик кнопки "Начать заново"
restartGameBtn.addEventListener('click', function() {
resetGameState();
initGame();
saveResultForm.style.display = 'none';
playerNameInput.value = '';

// Сбрасываем флаг активности игры
gameActive = false;

// Останавливаем таймер если он был запущен
if (timerRunning) {
clearInterval(gameInterval);
timerRunning = false;
}

// Сбрасываем отображение таймера
document.getElementById('game-timer').textContent = '0';
});

// Кнопка сохранения результата
saveResultBtn.addEventListener('click', function() {
const playerName = playerNameInput.value.trim();

if (!playerName) {
alert('Пожалуйста, введите ваше имя!');
return;
}

if (playerName.length > 20) {
alert('Имя не должно превышать 20 символов!');
return;
}

saveResult(playerName, moves, gameTimer);
playerNameInput.value = '';
saveResultForm.style.display = 'none';
});

// Функция инициализации игры
function initGame() {
const grid = document.getElementById('memory-grid');
grid.innerHTML = '';

const symbols = ['💍', '💐', '🥂', '🔥', '🏠', '👰', '🤵', '❤️', '🎉', '🎶', '🍖', '🌲', '👞', '🍰', '🕊️'];
const gameSymbols = [...symbols, ...symbols]; // 30 карточек (15 пар)

// Перемешиваем символы
const shuffledSymbols = [...gameSymbols].sort(() => Math.random() - 0.5);

// Создаем карточки
shuffledSymbols.forEach((symbol, index) => {
const card = document.createElement('div');
card.className = 'memory-card';
card.dataset.symbol = symbol;
card.dataset.index = index;

card.addEventListener('click', flipCard);
grid.appendChild(card);
});

// Настраиваем адаптивность для мобильных
adjustGameForMobile();
}

// Функция сброса состояния игры
function resetGameState() {
// Останавливаем таймер если он был запущен
if (timerRunning) {
clearInterval(gameInterval);
timerRunning = false;
}

gameTimer = 0;
moves = 0;
pairsFound = 0;
firstCard = null;
secondCard = null;
lockBoard = false;
gameActive = false;

document.getElementById('moves').textContent = '0';
document.getElementById('game-timer').textContent = '0';
document.getElementById('pairs').textContent = '0';
}

// Запуск таймера
function startTimer() {
if (!timerRunning) {
gameTimer = 0;
timerRunning = true;
gameInterval = setInterval(() => {
    gameTimer++;
    document.getElementById('game-timer').textContent = gameTimer;
}, 1000);
}
}

// Функция переворота карточки
function flipCard() {
if (lockBoard) return;
if (this === firstCard) return;
if (this.classList.contains('matched')) return;

// Запускаем таймер при первом клике на карточку
if (!gameActive) {
gameActive = true;
startTimer();
}

this.classList.add('flipped');
this.textContent = this.dataset.symbol;

if (!firstCard) {
firstCard = this;
return;
}

secondCard = this;
moves++;
document.getElementById('moves').textContent = moves;

checkForMatch();
}

// Проверка совпадения карточек
function checkForMatch() {
const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

if (isMatch) {
disableCards();
pairsFound++;
document.getElementById('pairs').textContent = pairsFound;

if (pairsFound === 15) {
    // Останавливаем таймер при завершении игры
    if (timerRunning) {
        clearInterval(gameInterval);
        timerRunning = false;
    }
    
    setTimeout(() => {
        showResultModal();
    }, 500);
}
} else {
unflipCards();
}
}

// Отключение совпавших карточек
function disableCards() {
firstCard.classList.add('matched');
secondCard.classList.add('matched');
firstCard.removeEventListener('click', flipCard);
secondCard.removeEventListener('click', flipCard);

resetBoard();
}

// Переворот несовпавших карточек обратно
function unflipCards() {
lockBoard = true;

setTimeout(() => {
firstCard.classList.remove('flipped');
firstCard.textContent = '';
secondCard.classList.remove('flipped');
secondCard.textContent = '';

resetBoard();
}, 1000);
}

// Сброс состояния доски
function resetBoard() {
[firstCard, secondCard, lockBoard] = [null, null, false];
}

// Показать модальное окно с результатами
function showResultModal() {
// Создаем модальное окно
const modal = document.createElement('div');
modal.className = 'result-modal';
modal.style.display = 'flex';

modal.innerHTML = `
<div class="result-modal-content">
    <h3>Поздравляем!</h3>
    <p>Вы нашли все пары за <strong>${moves}</strong> ходов и <strong>${gameTimer}</strong> секунд!</p>
    <p>Хотите сохранить результат в турнирную таблицу?</p>
    <div class="result-modal-buttons">
        <button class="result-modal-btn save" id="save-to-leaderboard">Сохранить результат</button>
        <button class="result-modal-btn play-again" id="play-again">Играть снова</button>
        <button class="result-modal-btn close" id="close-modal">Закрыть</button>
    </div>
</div>
`;

document.body.appendChild(modal);

// Обработчики кнопок модального окна
document.getElementById('save-to-leaderboard').addEventListener('click', function() {
modal.remove();
// Показываем форму для ввода имени
leaderboardContainer.style.display = 'block';
saveResultForm.style.display = 'block';
playerNameInput.focus();
});

document.getElementById('play-again').addEventListener('click', function() {
modal.remove();
resetGameState();
initGame();
saveResultForm.style.display = 'none';
});

document.getElementById('close-modal').addEventListener('click', function() {
modal.remove();
});

// Закрытие по клику вне окна
modal.addEventListener('click', function(e) {
if (e.target === modal) {
    modal.remove();
}
});
}

// Сохранение результата в турнирную таблицу
function function saveResult(name, moves, time) {
  // Получаем текущие результаты
  let leaderboard = getLeaderboard();

  // Добавляем новый результат
  const newResult = {
    name: name,
    moves: moves,
    time: time,
    date: new Date().toISOString()
  };

  leaderboard.push(newResult);

  // Сортируем по количеству ходов и времени
  leaderboard.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves; // Меньше ходов - лучше
    }
    return a.time - b.time; // Если ходы равны - меньше время
  });

  // Оставляем только топ-10 результатов
  leaderboard = leaderboard.slice(0, 10);

  // Сохраняем в localStorage
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));

  // Обновляем отображение таблицы
  loadLeaderboard();

  // Показываем подтверждение
  alert(`Результат ${name} сохранен в турнирную таблицу!`);
}
Замените её на новую версию:

javascript
// URL вашего Google Apps Script (вставьте свой после развертывания)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgMEbBrT_Yc5_5Fan6Y0Qiwf0iVE3Fr-dwNIrlCC2lWCWui0YLxx24C3PJL8ZSxNDY/exec';

// Сохранение результата в турнирную таблицу
async function saveResult(name, moves, time) {
  try {
    // Отключаем кнопку для предотвращения повторных нажатий
    saveResultBtn.disabled = true;
    saveResultBtn.textContent = 'Сохраняем...';
    
    // Отправляем результат на сервер
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveMemoryScore',
        data: { name: name, moves: moves, time: time }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Сохраняем также локально (как запасной вариант)
      saveToLocalStorage(name, moves, time);
      
      // Обновляем таблицу лидеров
      await loadLeaderboard();
      
      // Показываем сообщение об успехе
      showNotification(`🎉 Результат сохранен! Место в таблице: ${result.rank || 'топ-10'}`);
      
      // Скрываем форму через 2 секунды
      setTimeout(() => {
        saveResultForm.style.display = 'none';
      }, 2000);
    } else {
      // Если ошибка сервера - сохраняем локально
      saveToLocalStorage(name, moves, time);
      loadLeaderboard();
      showNotification('⚠️ Результат сохранен локально (ошибка сервера)');
    }
    
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    // При ошибке сети сохраняем локально
    saveToLocalStorage(name, moves, time);
    loadLeaderboard();
    showNotification('⚠️ Результат сохранен локально (ошибка сети)');
    
  } finally {
    // Восстанавливаем кнопку
    saveResultBtn.disabled = false;
    saveResultBtn.textContent = 'Сохранить результат';
  }
}

// Сохранение в localStorage как запасной вариант
function saveToLocalStorage(name, moves, time) {
  let leaderboard = getLeaderboard();
  
  const newResult = {
    name: name,
    moves: moves,
    time: time,
    date: new Date().toISOString()
  };
  
  leaderboard.push(newResult);
  leaderboard.sort((a, b) => {
    if (a.moves !== b.moves) return a.moves - b.moves;
    return a.time - b.time;
  });
  
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Красивое уведомление вместо alert
function showNotification(message) {
  // Удаляем старое уведомление если есть
  const oldNotification = document.querySelector('.game-notification');
  if (oldNotification) oldNotification.remove();
  
  const notification = document.createElement('div');
  notification.className = 'game-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #8B7355;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-family: inherit;
  `;
  
  document.body.appendChild(notification);
  
  // Автоудаление через 3 секунды
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Добавьте в CSS эти анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Загрузка турнирной таблицы
async function loadLeaderboard() {
  const leaderboardElement = document.getElementById('leaderboard');
  
  // Показываем индикатор загрузки
  leaderboardElement.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Загружаем таблицу лидеров...</p>
    </div>
  `;
  
  // Стили для индикатора загрузки
  const loadingStyle = document.createElement('style');
  loadingStyle.textContent = `
    .loading {
      text-align: center;
      padding: 20px;
      color: #8B7355;
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(139, 115, 85, 0.3);
      border-radius: 50%;
      border-top-color: #8B7355;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(loadingStyle);
  
  try {
    // Пробуем загрузить из Google Sheets
    const response = await fetch(`${SCRIPT_URL}?action=getTopScores`);
    const cloudLeaderboard = await response.json();
    
    if (cloudLeaderboard && cloudLeaderboard.length > 0) {
      // Используем результаты из облака
      displayLeaderboard(cloudLeaderboard, 'cloud');
    } else {
      // Если облако пустое - показываем локальные результаты
      const localLeaderboard = getLeaderboard();
      if (localLeaderboard.length > 0) {
        displayLeaderboard(localLeaderboard, 'local');
      } else {
        showNoResults();
      }
    }
    
  } catch (error) {
    console.error('Ошибка загрузки из облака:', error);
    // При ошибке - показываем локальные результаты
    const localLeaderboard = getLeaderboard();
    if (localLeaderboard.length > 0) {
      displayLeaderboard(localLeaderboard, 'local');
    } else {
      showNoResults();
    }
  }
  
  // Удаляем стили индикатора
  setTimeout(() => loadingStyle.remove(), 1000);
}

// Отображение таблицы лидеров
function displayLeaderboard(leaderboard, source) {
  const leaderboardElement = document.getElementById('leaderboard');
  
  let tableHTML = `
    <div class="leaderboard-header">
      <h3>Турнирная таблица</h3>
      <small>${source === 'cloud' ? '🎯 Общая таблица' : '📱 Локальные результаты'}</small>
    </div>
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Имя</th>
          <th>Ходы</th>
          <th>Время</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  leaderboard.forEach((result, index) => {
    // Добавляем специальные классы для призовых мест
    const rowClass = index < 3 ? `top-${index + 1}` : '';
    
    tableHTML += `
      <tr class="${rowClass}">
        <td class="player-rank">
          ${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
        </td>
        <td class="player-name">${result.name}</td>
        <td class="player-moves">${result.moves}</td>
        <td class="player-time">${result.time} сек</td>
      </tr>
    `;
  });
  
  tableHTML += `</tbody></table>`;
  
  // Кнопка обновления
  tableHTML += `
    <div class="leaderboard-footer">
      <button id="refresh-leaderboard" class="refresh-btn">
        🔄 Обновить таблицу
      </button>
    </div>
  `;
  
  leaderboardElement.innerHTML = tableHTML;
  leaderboardContainer.style.display = 'block';
  
  // Добавляем обработчик для кнопки обновления
  document.getElementById('refresh-leaderboard').addEventListener('click', loadLeaderboard);
}

// Показать сообщение об отсутствии результатов
function showNoResults() {
  const leaderboardElement = document.getElementById('leaderboard');
  leaderboardElement.innerHTML = `
    <div class="no-results">
      <p>🎮 Пока нет результатов</p>
      <p>Будьте первым!</p>
      <button id="refresh-leaderboard" class="refresh-btn">
        🔄 Обновить таблицу
      </button>
    </div>
  `;
  leaderboardContainer.style.display = 'block';
  
  document.getElementById('refresh-leaderboard').addEventListener('click', loadLeaderboard);
}

// Получение турнирной таблицы из localStorage
function getLeaderboard() {
try {
const stored = localStorage.getItem(LEADERBOARD_KEY);
return stored ? JSON.parse(stored) : [];
} catch (e) {
console.error('Ошибка загрузки турнирной таблицы:', e);
return [];
}
}

// Адаптация игры для мобильных устройств
function adjustGameForMobile() {
const grid = document.getElementById('memory-grid');
if (!grid) return;

const width = window.innerWidth;
const cards = document.querySelectorAll('.memory-card');

// Настраиваем количество колонок в зависимости от ширины экрана
if (width <= 380) {
grid.style.maxWidth = '300px';
grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
grid.style.gridTemplateRows = 'repeat(6, 1fr)';
} else if (width <= 480) {
grid.style.maxWidth = '350px';
grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
grid.style.gridTemplateRows = 'repeat(6, 1fr)';
} else if (width <= 576) {
grid.style.maxWidth = '400px';
grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
grid.style.gridTemplateRows = 'repeat(6, 1fr)';
} else if (width <= 768) {
grid.style.maxWidth = '500px';
grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
grid.style.gridTemplateRows = 'repeat(6, 1fr)';
} else {
// Десктоп - 6x5
grid.style.maxWidth = '650px';
grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
grid.style.gridTemplateRows = 'repeat(5, 1fr)';
}

// Устанавливаем фиксированный размер для карточек
cards.forEach(card => {
if (width <= 768) {
    // На мобильных - адаптивный размер
    card.style.width = '100%';
    card.style.height = '100%';
    card.style.minWidth = '48px';
    card.style.minHeight = '48px';
} else {
    // На десктопе - фиксированный размер 87.862px
    card.style.width = '87.862px';
    card.style.height = '87.862px';
}
});
}

// Вызываем при изменении размера окна
window.addEventListener('resize', adjustGameForMobile);

// Загружаем турнирную таблицу при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
loadLeaderboard();
});
