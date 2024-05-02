// Обработчик события, который выполняется после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Парсинг параметров URL для получения ID заявки
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = parseInt(urlParams.get('requestId'), 10);
    const employeeID = parseInt(urlParams.get('employeeID'), 10);

    // Получение элементов страницы по их ID
    const all = document.getElementById('all');
    const client = document.getElementById('client');
    const status = document.getElementById('status');
    const employee = document.getElementById('employee');
    const sistem = document.getElementById('sistem'); // Элемент не используется в предоставленном коде
    const bot = document.getElementById('bot'); // Элемент не используется в предоставленном коде
    const me = document.getElementById('me'); // Элемент не используется в предоставленном коде
    const feedback = document.getElementById('feedback'); // Элемент не используется в предоставленном коде
    const avatar = document.getElementById('avatar');
    const massager = document.getElementById('massager');
    const sendButton = document.getElementById('massageBtn');
    const textarea = document.getElementById('textarea');
    const endBtn = document.getElementById('registration-form__submit');
    let employeeId;
    let userId;

    // Функция для отправки сообщений в чат
    function sendMessage(content, className, avatarSrc, requestId, userId) {
        const messageElement = document.createElement('span');
        messageElement.className = `massage ${className}`;
        messageElement.innerHTML = `<img src=${avatarSrc} alt="" class="massage__avatar">
                                    <p class="massage__text">${content}</p>`;
        massager.appendChild(messageElement);
    }

    // Функция для обновления статуса заявки на сервере
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

    function updateEmployee(requestId, employeeId) {
        fetch(`/update-employeeID`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, employeeId }) // Changed 'status' to 'employeeId'
        })
        .then(response => response.json())
        .then(data => console.log('Employee ID updated:', data))
        .catch(error => console.error('Error updating employee ID:', error));
    }

    // Функция для обновления последнего ID запроса у сотрудника
    function updateEmployeeLastRequestId(employeeId, requestId) {
        fetch('/update-last-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, requestId })
        })
        .then(response => response.json())
        .then(data => console.log('Last Request ID Update Response:', data))
        .catch(error => console.error('Error updating last request ID:', error));
    }

    // Функция для обновления количества запросов у сотрудника
    function updateEmployeeNumberReq(employeeId, number) {
        fetch('/update-number-req', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, number })
        })
        .then(response => response.json())
        .then(data => console.log('Number of requests update response:', data))
        .catch(error => console.error('Error updating number of requests:', error));
    }

    // Отправка данных сообщения на сервер
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

    all.href = `request.html?employeeID=${employeeID}`;

    // Получение данных о текущей заявке
    fetch(`/requests/${requestId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Request Data:', data); // Логирование данных заявки

            // Автоматическое обновление статуса заявки при необходимости
            if (data.status === 'Нужен сотрудник') {
                updateStatus(requestId, 'Сотрудник назначен');
                console.log(employeeID)
                updateEmployee(requestId, employeeID)
            }

            // Обновление статуса и данных пользователя на странице
            status.innerHTML = data.status === 'Успешно реализован отзыв получен' ? "Закрыта" : "Активна";
            feedback.innerHTML = data.feedback
            me.innerHTML = data.grade
            fetch(`/users/${data.user_id}`)
                .then(response => response.json())
                .then(user => {
                    client.innerHTML = user.fio;
                    userId = parseInt(user.id, 10);
                    fetch(`/employees/${data.employee_id}`)
                        .then(response => response.json())
                        .then(employees => {
                            employeeId = employees.id;
                            updateEmployeeLastRequestId(employeeId, requestId);
                            endBtn.addEventListener('click', () => {
                                updateStatus(requestId, 'Успешно реализован отзыва нет')
                                updateEmployeeNumberReq(employeeId, 1)
                                const feedbackRequestMessage = "Пожалуйста, оцените работу нашего сотрудника и оставьте ваш отзыв в формате Оценка: 'оценка'. 'отзыв'. Ваше мнение очень важно для нас!";
                                sendMessage(feedbackRequestMessage, 'me', `"./img/JPG/employeeAvatar${employeeID}.jpg"`, requestId, employeeID);
                                sendMessageToDB(feedbackRequestMessage, 'me', `"./img/JPG/employeeAvatar${employeeID}.jpg"`, requestId, employeeID);
                            });
                            employee.innerHTML = employees.full_name;
                            avatar.src = `./img/JPG/employeeAvatar${employees.id}.jpg`
                            data.dialog.forEach(message => {
                                sendMessage(message.message, message.user_id === userId ? 'employee' : 'me', message.user_id === userId ? `"./img/JPG/anonAvatar.jpg"` : `"./img/JPG/employeeAvatar${message.user_id}.jpg"`, data.id, message.user_id);
                            });
                        })
                })
        })
        .catch(error => console.error('Error fetching request data:', error));

    // Обработчик клика по кнопке отправки сообщения
    sendButton.addEventListener('click', () => {
        const messageText = textarea.value.trim(); // Получение текста сообщения из текстового поля

        if (messageText) { // Проверка наличия текста перед отправкой
            sendMessage(messageText, 'employee', `./img/JPG/employeeAvatar${employeeId}.jpg`, requestId, employeeId);
            sendMessageToDB(messageText, 'employee', `./img/JPG/employeeAvatar${employeeId}.jpg`, requestId, employeeId);
            const lastMessage = chats.querySelector('.chat__last');
            lastMessage.textContent = messageText;

            Object.keys(botResponses).forEach(key => {
                if (messageText.toLowerCase().includes(key)) {
                    sendMessage(botResponses[key], 'me', './img/JPG/anonAvatar.jpg', requestId, 9);
                    sendMessageToDB(botResponses[key], 'me', './img/JPG/anonAvatar.jpg', requestId, 9);
                    const lastMessage = chats.querySelector('.chat__last');
                    lastMessage.textContent = botResponses[key];
                    botUnderstood = true;
                    failedAttempts = 0;
                }
            });

            textarea.value = ''; // Очистка поля ввода после отправки
        }
    });
});
