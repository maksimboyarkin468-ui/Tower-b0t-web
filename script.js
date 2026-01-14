// Массив цифр от 1 до 7
const signalNumbers = [1, 2, 3, 4, 5, 6, 7];

// Проверка, открыто ли приложение через Telegram Web App
function isTelegramWebApp() {
    return window.Telegram && window.Telegram.WebApp;
}

// Инициализация Telegram Web App
function initTelegramWebApp() {
    if (isTelegramWebApp()) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        return true;
    }
    return false;
}

// Проверка доступа через API бота
async function checkUserAccess() {
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Инициализируем Telegram Web App
    const isTelegram = initTelegramWebApp();
    
    if (!isTelegram) {
        // Если не через Telegram - показываем сообщение
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        errorMessage.textContent = '❌ Это приложение работает только через Telegram бота!\n\n📱 Откройте бота в Telegram и нажмите кнопку "🌐 Открыть Web-App"';
        errorMessage.classList.add('show');
        return false;
    }
    
    // Получаем данные пользователя из Telegram Web App
    const tg = window.Telegram.WebApp;
    const user = tg.initDataUnsafe?.user;
    const userId = user?.id;
    
    if (!userId) {
        // Если нет данных пользователя, все равно показываем меню (для обратной совместимости)
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainMenuScreen').classList.add('active');
        errorMessage.classList.remove('show');
        return true;
    }
    
    // Проверяем доступ через API бота (если доступен)
    // Если API недоступен, используем проверку через Telegram Web App
    // Пользователь уже прошел проверки в боте, раз смог открыть веб-приложение
    
    // Пробуем проверить через API бота (только если бот размещен на публичном сервере)
    // Для локального бота API недоступен из веб-приложения на Netlify
    const apiEndpoint = 'http://localhost:8080/api/check_user'; // Замените на публичный URL вашего сервера с ботом
    
    // Проверяем, можем ли мы обратиться к API
    // Если веб-приложение на Netlify, API на localhost недоступен
    const canUseApi = window.location.hostname.includes('localhost') || 
                      window.location.hostname.includes('127.0.0.1') ||
                      apiEndpoint.startsWith('https://'); // Если API на HTTPS сервере
    
    if (canUseApi && userId) {
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
                // Таймаут для запроса
                signal: AbortSignal.timeout(3000) // 3 секунды
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.has_access) {
                    // Пользователь имеет доступ - показываем главное меню
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    document.getElementById('loginScreen').classList.remove('active');
                    document.getElementById('mainMenuScreen').classList.add('active');
                    errorMessage.classList.remove('show');
                    return true;
                } else {
                    // Пользователь не имеет доступа - показываем сообщение
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    let message = '❌ Доступ ограничен!\n\n';
                    if (!data.has_deposit) {
                        message += '💰 Необходимо внести депозит\n';
                    }
                    if (!data.is_subscribed) {
                        message += '📢 Необходимо подписаться на канал\n';
                    }
                    message += '\n📱 Вернитесь в бота и выполните необходимые действия.';
                    errorMessage.textContent = message;
                    errorMessage.classList.add('show');
                    return false;
                }
            }
        } catch (error) {
            console.log('API недоступен, используем проверку через Telegram Web App:', error);
            // Продолжаем выполнение - используем проверку через Telegram
        }
    }
    
    // Если API недоступен или не используется, показываем меню
    // Пользователь уже прошел проверки в боте, раз смог открыть веб-приложение
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainMenuScreen').classList.add('active');
    errorMessage.classList.remove('show');
    return true;
}

// Проверка пароля (для обратной совместимости)
function checkPassword() {
    checkUserAccess();
}

// Показ сигнала с анимацией загрузки
function showSignal() {
    const signalNumber = document.getElementById('signalNumber');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!signalNumber || !loadingIndicator) {
        console.error('Элементы сигнала не найдены');
        return;
    }
    
    // Получаем случайную цифру от 1 до 7
    const randomIndex = Math.floor(Math.random() * signalNumbers.length);
    const number = signalNumbers[randomIndex];
    
    // Сразу устанавливаем текст цифры
    signalNumber.textContent = number;
    
    // Показываем индикатор загрузки
    signalNumber.style.display = 'none';
    loadingIndicator.style.display = 'flex';
    
    // Показываем цифру через небольшую задержку
    setTimeout(function() {
        // Получаем элементы заново для надежности
        const sigNum = document.getElementById('signalNumber');
        const loadInd = document.getElementById('loadingIndicator');
        
        if (sigNum && loadInd) {
            // Скрываем индикатор загрузки
            loadInd.style.display = 'none';
            // Показываем цифру
            sigNum.style.display = 'flex';
        } else {
            console.error('Элементы не найдены в setTimeout');
        }
    }, 500); // 0.5 секунды - достаточно для визуального эффекта
}

// Получить следующий сигнал
function getNextSignal() {
    const btn = document.querySelector('.signal-btn');
    if (!btn) {
        console.error('Кнопка сигнала не найдена');
        return;
    }
    
    // Блокируем кнопку на короткое время
    btn.disabled = true;
    btn.textContent = 'Загрузка...';
    
    showSignal();
    
    // Разблокируем кнопку почти мгновенно (0.15 секунды)
    setTimeout(function() {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Получить сигнал➡️';
        }
    }, 150);
}

// Перейти к сигналам из главного меню
function goToSignals() {
    const mainMenuScreen = document.getElementById('mainMenuScreen');
    const signalScreen = document.getElementById('signalScreen');
    
    if (!mainMenuScreen || !signalScreen) {
        console.error('Экраны не найдены');
        return;
    }
    
    mainMenuScreen.classList.remove('active');
    signalScreen.classList.add('active');
    
    // Сбрасываем состояние сигнала
    const signalNumber = document.getElementById('signalNumber');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (signalNumber) {
        signalNumber.style.display = 'none';
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    
    // Показываем первый сигнал через небольшую задержку
    setTimeout(function() {
        showSignal();
    }, 100);
}

// Вернуться назад (к главному меню)
function goBack() {
    // Возвращаемся к главному меню
    document.getElementById('signalScreen').classList.remove('active');
    document.getElementById('mainMenuScreen').classList.add('active');
}

// Написать в поддержку
function contactSupport() {
    window.open('https://t.me/nomep999', '_blank');
}

// Поддержать наш ТГК
function supportChannel() {
    window.open('https://t.me/maksoncikaz', '_blank');
}

// Обработка нажатия Enter в поле пароля
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});

