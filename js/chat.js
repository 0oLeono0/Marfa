document.addEventListener('DOMContentLoaded', () => {
    const admins = [
        {
            FIO: "Кожанный мешок - Марфа",
            mail: "marfa@gmail.com",
            avatar: "./img/JPG/avatar.png"
        },
        {
            FIO: "Кожанный мешок - Леонид",
            mail: "leonid@mail.com",
            avatar: "./img/JPG/abobaAvatar.jpg"
        },
        {
            FIO: "Кожанный мешок - Дарина",
            mail: "bogun@gmail.com",
            avatar: "./img/JPG/bibaAvatar.jpg"
        },
    ]

    const chats = document.getElementById('chats');
    const massager = document.getElementById('massager');
    const sendButton = document.getElementById('massageBtn');
    const textarea = document.getElementById('textarea');
    let avatar = document.getElementById('avatar');
    let name = document.getElementById('name');

    // Ключевые фразы и ответы чат-бота
    const botResponses = {
        "привет": "Здравствуйте! Чем могу помочь?",
        "помощь": "Какую помощь вы ищете?",
        "статус заказа": "Пожалуйста, укажите номер вашего заказа.",
        "возврат товара": "Вы можете вернуть товар в течение 30 дней.",
        "работа сервиса": "Сервис работает круглосуточно. Если у вас возникли проблемы, описывайте их."
    };
    let failedAttempts = 0;
    let currentStatus = 'новый чат';

    function sendMessage(content, className, avatar) {
        const messageElement = document.createElement('span');
        messageElement.className = `massage ${className}`;
        messageElement.innerHTML = `<img src=${avatar} alt="" class="massage__avatar">
                                    <p class="massage__text">${content}</p>`;
        massager.appendChild(messageElement);
    }

    function selectRandomAdmin() {
        const randomIndex = Math.floor(Math.random() * admins.length);
        return admins[randomIndex];
    }

    sendButton.addEventListener('click', () => {
        const messageText = textarea.value.trim();
        let botUnderstood = false;

        if (messageText) {
            sendMessage(messageText, 'me', './img/JPG/anonAvatar.jpg');

            if (currentStatus === 'требуется сотрудник') {
                const admin = selectRandomAdmin();
                const chatIcon = chats.querySelector('.chat__icon');
                const chatName = chats.querySelector('.chat__header');

                chatIcon.src = admin.avatar;
                chatName.textContent = admin.FIO;
                avatar.src = admin.avatar
                name.textContent = admin.FIO;

                sendMessage("Сотрудник назначен: " + admin.FIO, 'client', admin.avatar);
                currentStatus = 'сотрудник назначен';
            } else {
                // Проверяем, содержит ли сообщение одну из ключевых фраз
                Object.keys(botResponses).forEach(key => {
                    if (messageText.toLowerCase().includes(key)) {
                        sendMessage(botResponses[key], 'client', './img/JPG/avatarChat.jpg');
                        botUnderstood = true;
                    }
                });

                if (!botUnderstood) {
                    failedAttempts++;
                    if (failedAttempts >= 3) {
                        sendMessage("Видимо возникли трудности с пониманием, вызываю на помощь кожаный мешок", 'client', './img/JPG/avatarChat.jpg');
                        currentStatus = 'требуется сотрудник';
                        failedAttempts = 0;
                    } else {
                        sendMessage("Я вас не понял, попробуйте переформулировать свой вопрос", 'client', './img/JPG/avatarChat.jpg');
                    }
                }
            }

                // Обновляем последнее сообщение и статус в чате
                if (chats.children.length === 0) {
                    // Если чатов нет, создаем новый чат
                    const chatElement = document.createElement('div');
                    chatElement.className = 'chat';
                    chatElement.innerHTML = `<img src="./img/JPG/avatarChat.jpg" alt="" class="chat__icon">
                                         <span class="chat__name">
                                             <h2 class="chat__header">Техническая поддержка</h2>
                                             <p class="chat__last">${messageText}</p>
                                         </span>`;
                    chats.appendChild(chatElement);
                } else {
                    // Обновляем последнее сообщение и статус в чате
                    const lastMessage = chats.querySelector('.chat__last');
                    lastMessage.textContent = messageText;
                    const statusElement = chats.querySelector('.chat__status');
                    statusElement.textContent = currentStatus;
                }

                // Очищаем textarea после отправки сообщения
                textarea.value = '';
            }
        });
});
