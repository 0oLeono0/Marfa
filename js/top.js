document.addEventListener('DOMContentLoaded', () => {
    const rate = document.getElementById('rate');

    fetch('/employee')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Вычисление рейтинга для каждого сотрудника и добавление его к данным сотрудника
            data.forEach(employee => {
                employee.rating = employee.grade + (0.5 * employee.required_hours + employee.overtime) / employee.number_req;
            });

            // Сортировка сотрудников по рейтингу в убывающем порядке
            data.sort((a, b) => b.rating - a.rating);

            // Создание HTML для каждого сотрудника
            data.forEach((employee, index) => {
                const employeeElement = document.createElement('div');
                employeeElement.className = 'rate__row';
                employeeElement.innerHTML = `
                <div class="rate__num">#${index + 1}</div>
                <div class="rate__name">${employee.full_name}</div>
                <div class="rate__post">
                    <div class="rate__post__who">
                        <p class="rate__post__who__post">${employee.position}</p>
                    </div>
                    <img src="./img/JPG/employeeAvatar${employee.id}.jpg" alt="" class="rate__post__avatar">
                </div>
            `;
                rate.appendChild(employeeElement);
            });
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
});
