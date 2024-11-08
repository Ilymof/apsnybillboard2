// Проверка токена при загрузке страницы
window.onload = function() {
    const token = localStorage.getItem('token');
    if (token) {
        showAdCreatePage();
    } else {
        showLoginPage();
    }
};

// Показ страницы входа
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adCreatePage').style.display = 'none';
}

// Показ страницы создания объявления
function showAdCreatePage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adCreatePage').style.display = 'block';
}

// Обработчик отправки формы входа
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Сохраняем токен в localStorage и переходим на страницу создания объявления
            localStorage.setItem('token', data.token);
            showAdCreatePage();
        } else {
            document.getElementById('loginMessage').textContent = data.message;
        }
    } catch (error) {
        document.getElementById('loginMessage').textContent = "Ошибка при входе";
        console.error(error);
    }
});

// Обработчик отправки формы создания объявления
document.getElementById('adForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const token = localStorage.getItem('token');

    if (!token) {
        document.getElementById('adMessage').textContent = "Необходимо войти в аккаунт";
        return;
    }

    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/ad', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('adMessage').textContent = "Объявление успешно добавлено!";
            console.log(data);
        } else {
            document.getElementById('adMessage').textContent = "Ошибка: " + data.message;
        }
    } catch (error) {
        document.getElementById('adMessage').textContent = "Не удалось добавить объявление";
        console.error(error);
    }
});

// Функция выхода из аккаунта
function logout() {
    localStorage.removeItem('token');
    showLoginPage();
}