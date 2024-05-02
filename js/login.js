// Обработчик события, который выполняется после полной загрузки содержимого DOM-документа
document.addEventListener('DOMContentLoaded', () => {
    // Получение DOM-элементов формы по их ID
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const registrationButton = document.getElementById('registration-form__submit');
    
    // Запрос на сервер для получения списка пользователей
    fetch('/users')
    .then(response => {
        // Проверка успешности ответа сервера
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Логирование данных пользователей
        
        // Обработчик клика на кнопке регистрации
        registrationButton.addEventListener('click', (event) => {
            event.preventDefault(); // Предотвращение стандартного поведения кнопки формы
            
            // Поиск существующего пользователя по электронной почте
            const user = data.find(user => user.email === email.value);
            
            // Управление редиректами в зависимости от статуса пользователя
            if (user) {
                if (user.admin) {
                    // Редирект администратора к последнему запросу
                    fetch(`/employees/${parseInt(user.id, 10)}`)
                        .then(response => response.json())
                        .then(employees => {
                            window.location.href = `chatReq.html?requestId=${employees.last_request_id}&employeeID=${user.id}`;
                        })
                } else {
                    // Редирект пользователя к чату
                    window.location.href = `Chat.html?userId=${user.id}`;
                }
            } else {
                // Сообщение, если пользователь не найден
                alert("Пользователя с такой почтой не существует, попробуйте зарегистрироваться");
                return;
            }
            
            // Проверка заполненности всех обязательных полей
            if (!email.value || !password.value || !confirmPassword.value) {
                alert('Все поля должны быть заполнены.');
                return;
            }
            
            // Проверка совпадения введенных паролей
            if (password.value !== confirmPassword.value) {
                alert('Пароли не совпадают.');
                return;
            } else if (password.value !== user.password) {
                // Проверка соответствия пароля сохраненному значению
                alert('Пароль не верен');
                return;
            }
        });
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
});
