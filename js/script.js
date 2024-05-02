document.addEventListener('DOMContentLoaded', () => {
    const email = document.getElementById('email');
    const name = document.getElementById('fullName');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const registrationButton = document.getElementById('registration-form__submit');
    const vklink = document.getElementById('vkLink');
    const checkbox = document.getElementById('checkbox');
    
    fetch('/users')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Обработка полученных данных
        console.log(data);
        
        registrationButton.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Проверка заполненности всех полей
            if (!email.value || !name.value || !password.value || !confirmPassword.value || !checkbox.checked) {
                alert('Все поля должны быть заполнены.');
                return;
            }
            
            // Проверка совпадения паролей
            if (password.value !== confirmPassword.value) {
                alert('Пароли не совпадают.');
                return;
            }
            
            // Поиск пользователя
            const user = data.find(user => user.email === email.value);
            if (user) {
                alert("Пользователь с такой почтой уже существует, попробуйте войти или использовать другую почту")
                return
            } else {
                // Создание нового пользователя
                const newUser = {
                    id: data.length + 1, // Генерация нового id
                    fio: name.value,
                    email: email.value,
                    password: password.value,
                    vklink: vklink.value, // Дополнительные поля по необходимости
                    admin: false
                };
                
                // Отправка POST запроса для создания нового пользователя
                fetch('/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('New user created:', data);
                    // Перенаправление на нужную страницу
                    window.location.href = `Chat.html?userId=${newUser.id}`;
                })
                .catch(error => {
                    console.error('There was a problem with creating a new user:', error);
                });
            }
        });
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
});
