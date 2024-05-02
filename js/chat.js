// Обработчик события, который выполняется после полной загрузки DOM документа
document.addEventListener('DOMContentLoaded', () => {
    // Извлечение параметров из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('userId'), 10);

    // Получение элементов страницы по их идентификаторам
    const massager = document.getElementById('massager');
    const chatsContainer = document.getElementById('chats');
    const sendButton = document.getElementById('massageBtn');
    const textarea = document.getElementById('textarea');
    let avatar = document.getElementById('avatar');
    let name = document.getElementById('name');

    // Переменные для контроля текущего состояния чата
    let currentRequestId; // ID текущего запроса пользователя
    let failedAttempts = 0; // Счетчик неудачных попыток понимания сообщений пользователя
    let currentStatus; // Текущий статус чата
    let employeeID;

    // Словарь для автоматических ответов бота
    const botResponses = {
        "привет": "Здравствуйте! Чем могу помочь?",
        "помощь": "Какую помощь вы ищете?",
        "статус заказа": "Пожалуйста, укажите номер вашего заказа.",
        "возврат товара": "Вы можете вернуть товар в течение 30 дней.",
        "работа сервиса": "Сервис работает круглосуточно. Если у вас возникли проблемы, описывайте их."
    };

    // Функция для отправки сообщения в чат
    function sendMessage(content, className, avatarSrc, requestId, userId) {
        const messageElement = document.createElement('span');
        messageElement.className = `massage ${className}`;
        messageElement.innerHTML = `<img src=${avatarSrc} alt="" class="massage__avatar">
                                    <p class="massage__text">${content}</p>`;
        massager.appendChild(messageElement);
    }

    // Функция для отправки сообщения в базу данных
    function sendMessageToDB(content, className, avatarSrc, requestId, userId) {
        const messageData = { requestId, message: content, user_id: userId };
        fetch('/update-dialog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        })
            .then(response => response.json())
            .then(data => console.log('Message added:', data))
            .catch(error => console.error('Error updating dialog:', error));
    }

    // Функция для очистки чата
    function clearMessages() {
        massager.innerHTML = '';
    }

    function createEmptyChat() {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat';
        chatElement.innerHTML = `
            <img src="./img/JPG/employeeAvatar9.jpg" alt="" class="chat__icon">
            <span class="chat__name">
                <h2 class="chat__header">Техническая поддержка</h2>
                <p class="chat__last">Начните диалог</p>
            </span>
        `;
        chatElement.onclick = () => {
            clearMessages();
            avatar.src = "./img/JPG/employeeAvatar9.jpg";
            name.textContent = "Техническая поддержка";
        };
        chatsContainer.appendChild(chatElement);
    }

    // Функция для создания нового чата в базе данных
    function createNewChatInDB(userId) {
        fetch(`/create-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, employee_id: 9, status: 'Работает чат-бот' })
        })
            .then(response => response.json())
            .then(data => {
                console.log('New chat created:', data);
                currentRequestId = data.requestId; // Сохраняем ID нового запроса
                updateStatus(currentRequestId, 'Работает чат-бот');
            })
            .catch(error => console.error('Error creating new chat in DB:', error));
    }

    function updateEmployeeRate(employeeId, grade) {
        fetch('/update-rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, grade })
        })
            .then(response => response.json())
            .then(data => console.log('Grade update response:', data))
            .catch(error => console.error('Error updating grade:', error));
    }


    // Функция для обновления статуса чата
    function updateStatus(requestId, newStatus) {
        fetch(`/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, status: newStatus })
        })
            .then(response => response.json())
            .then(data => console.log('Status updated:', data))
            .catch(error => console.error('Error updating status:', error));
    }

    function updateFeedback(requestId, feedback, grade) {
        fetch(`/update-request-feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, feedback, grade })
        })
        .then(response => response.json())
        .then(data => console.log('Request updated:', data))
        .catch(error => console.error('Error updating request:', error));
    }

    // Загрузка и обработка данных о существующих запросах
    fetch('/requests')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const requests = data.filter(item => item.user_id === userId);
            if (requests.length > 0) {
                requests.forEach((request, index) => {
                    console.log(request)
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat';
                    chatElement.innerHTML = `
                        <img src="./img/JPG/employeeAvatar${request.employee_id}.jpg" alt="" class="chat__icon">
                        <span class="chat__name">
                            <h2 class="chat__header">Техническая поддержка</h2>
                            <p class="chat__last">${request.dialog[request.dialog.length - 1].message}</p>
                        </span>
                    `;
                    chatElement.onclick = () => {
                        clearMessages();
                        currentRequestId = request.id; // Обновляем текущий requestId при выборе чата
                        employeeID = request.employee_id;
                        console.log(employeeID)
                        request.dialog.forEach(message => {
                            sendMessage(message.message, message.user_id === userId ? 'me' : 'employee', message.user_id === userId ? `"./img/JPG/anonAvatar.jpg"` : `"./img/JPG/employeeAvatar${request.employee_id}.jpg"`, request.id, message.user_id);
                        });
                        fetch(`/employees/${request.employee_id}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to fetch employee details');
                                }
                                return response.json();
                            })
                            .then(employeeData => {
                                avatar.src = `./img/JPG/employeeAvatar${request.employee_id}.jpg`;
                                const header = chatElement.querySelector('.chat__header');
                                if (header) {
                                    header.textContent = employeeData.full_name; // Обновление имени сотрудника в заголовке чата
                                }
                                name.textContent = employeeData.full_name; // Обновление имени сотрудника
                            })
                            .catch(error => {
                                console.error('Error fetching employee details:', error);
                            });
                    };
                    chatsContainer.appendChild(chatElement);

                    if (index === 0) {
                        chatElement.click();
                    }
                });
            } else {
                createEmptyChat();
                createNewChatInDB(userId);
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
            createEmptyChat();  // Создаем пустой чат при ошибке загрузки данных
            createNewChatInDB(userId);
        });

    // Обработчик клика кнопки отправки
    sendButton.addEventListener('click', () => {
        const messageText = textarea.value.trim();
        let botUnderstood = false;
        if (currentStatus === 'Успешно реализован отзыв получен') {
            return; // Не реагировать на ввод, если статус не позволяет взаимодействие
        }

        if (messageText) {
            if (!currentRequestId) {
                createNewChatInDB(userId);
            }
            sendMessage(messageText, 'me', './img/JPG/anonAvatar.jpg', currentRequestId, userId);
            sendMessageToDB(messageText, 'me', './img/JPG/anonAvatar.jpg', currentRequestId, userId);
            const lastMessage = chats.querySelector('.chat__last');
            lastMessage.textContent = messageText;

            const feedbackPattern = /Оценка:\s*(\d+)\.\s*(.*)/;
            const match = messageText.match(feedbackPattern);
            if (match) {
                const rating = parseInt(match[1]); // Получение оценки
                const review = match[2]; // Получение текста отзыва
                sendMessage("Спасибо за ваш отзыв", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                sendMessageToDB("Спасибо за ваш отзыв", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                updateEmployeeRate(employeeID, rating);
                updateFeedback(currentRequestId, review, rating);
                updateStatus(currentRequestId, 'Успешно реализован отзыв получен');
                textarea.value = ''
                return
            }

            if (currentStatus === 'Сотрудник назначен' || currentStatus === 'Успешно реализован отзыва нет') {
                return;
            }

            Object.keys(botResponses).forEach(key => {
                if (messageText.toLowerCase().includes(key)) {
                    sendMessage(botResponses[key], 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    sendMessageToDB(botResponses[key], 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    const lastMessage = chats.querySelector('.chat__last');
                    lastMessage.textContent = botResponses[key];
                    botUnderstood = true;
                    failedAttempts = 0;
                }
            });

            if (!botUnderstood) {
                failedAttempts++;
                if (failedAttempts >= 3) {
                    sendMessage("Видимо возникли трудности с пониманием, вызываю на помощь сотрудника", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    sendMessageToDB("Видимо возникли трудности с пониманием, вызываю на помощь сотрудника", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    const lastMessage = chats.querySelector('.chat__last');
                    lastMessage.textContent = "Видимо возникли трудности с пониманием, вызываю на помощь сотрудника";
                    updateStatus(currentRequestId, 'Нужен сотрудник');
                    failedAttempts = 0;
                } else {
                    sendMessage("Я вас не понял, попробуйте переформулировать свой вопрос", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    sendMessageToDB("Я вас не понял, попробуйте переформулировать свой вопрос", 'employee', './img/JPG/employeeAvatar9.jpg', currentRequestId, 9);
                    const lastMessage = chats.querySelector('.chat__last');
                    lastMessage.textContent = "Я вас не понял, попробуйте переформулировать свой вопрос";
                }
            }

            textarea.value = ''; // Очистка поля ввода после отправки
        }
    });
});
