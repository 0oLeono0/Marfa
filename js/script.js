document.addEventListener('DOMContentLoaded', () => {
    const admins = [
        {
            FIO: "Кузнецова Марфа",
            mail: "marfa@gmail.com",
        },
        {
            FIO: "Ивановский Леонид",
            mail: "leonid@mail.com",
        },
        {
            FIO: "Богун Дарина",
            mail: "bogun@gmail.com",
        },
    ]

    const users = [
        {
            FIO: "Касьяненко Павел",
            mail: "pasha@gmail.com",
        },
        {
            FIO: "Душков Александер",
            mail: "dushkov@mail.com",
        },
        {
            FIO: "Шакиров Вильдан",
            mail: "weldone@gmail.com",
        },
    ]
    const email = document.getElementById('email');
    const name = document.getElementById('fullName');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const registrationButton = document.getElementById('registration-form__submit');
    registrationButton.addEventListener('click', (event) => {
        // Предотвращение стандартного поведения формы
        event.preventDefault();
        
        // Проверка заполненности всех полей
        if (!email.value || !name.value || !password.value || !confirmPassword.value) {
            alert('Все поля должны быть заполнены.');
            return;
        }

        // Проверка совпадения паролей
        if (password.value !== confirmPassword.value) {
            alert('Пароли не совпадают.');
            return;
        }

        // Поиск пользователя и перенаправление
        const user = admins.find(user => user.mail === email.value);
        if (user) {
            window.location.href = 'chatReq.html';
        } else {
            window.location.href = 'Chat.html';
        }
    });
});

