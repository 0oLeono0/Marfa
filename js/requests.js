// Слушатель события, выполняющийся после загрузки всего содержимого DOM.
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeID = parseInt(urlParams.get('employeeID'), 10);
    // Функция для добавления блока в различные секции на странице.
    const populateSection = (sectionId, fullName, fio, date, requestId, employeeId) => {
        const section = document.getElementById(sectionId); // Получение элемента секции по ID
        const block = document.createElement('div'); // Создание нового div элемента
        block.className = 'col__block block'; // Присвоение классов для стилизации
        block.innerHTML = `
            <h2 class="col__block__header">${fullName}</h2>
            <p class="col__block__number">${fio}</p>
            <p class="col__block__date">${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}</p>
        `;
        block.addEventListener('click', () => {
            window.location.href = `chatReq.html?requestId=${requestId}&employeeID=${employeeID}`; // Перенаправление при клике на блок
        });
        section.appendChild(block); // Добавление блока в секцию
    };

    // Запрос на сервер для получения списка запросов
    fetch('/requests')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // Обработка ответа, если он не OK
            }
            return response.json(); // Парсинг JSON
        })
        .then(requests => {
            requests.forEach(item => {
                // Одновременный запрос данных пользователя и сотрудника
                Promise.all([
                    fetch(`/users/${item.user_id}`).then(res => res.json()),
                    fetch(`/employees/${item.employee_id}`).then(res => res.json())
                ]).then(([user, employee]) => {
                    // Определение, в какую секцию добавить блок, в зависимости от статуса запроса
                    switch (item.status) {
                        case 'Работает чат-бот':
                            populateSection('bot', 'Бот', user.fio, item.date, item.id);
                            break;
                        case 'Нужен сотрудник':
                            populateSection('need', 'Бот', user.fio, item.date, item.id, employee.id);
                            break;
                        case 'Сотрудник назначен':
                            populateSection('have', employee.full_name, user.fio, item.date, item.id, employee.id);
                            break;
                        case 'Успешно реализован отзыва нет':
                            populateSection('noFeedback', employee.full_name, user.fio, item.date, item.id, employee.id);
                            break;
                        case 'Успешно реализован отзыв получен':
                            populateSection('feedback', employee.full_name, user.fio, item.date, item.id);
                            break;
                    }
                }).catch(error => console.error('Failed to fetch user or employee data:', error)); // Логирование ошибки при запросе данных
            });
        })
        .catch(error => console.error('Failed to fetch requests:', error)); // Логирование ошибки при запросе списка запросов
});
