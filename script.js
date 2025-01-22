
window.onload = async function() {
    const token = localStorage.getItem('token');
    if (token) {
        showAdCreatePage();
        await populateRegionList();
        await populateCategoryList();
        await loadSubcategories();
    } else {
        showLoginPage();
    }
};

// Функции для показа нужной страницы
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('registrationPage').style.display = 'none';
    document.getElementById('confirmationPage').style.display = 'none';
    document.getElementById('adCreatePage').style.display = 'none';
}

function showRegistrationPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registrationPage').style.display = 'block';
    document.getElementById('confirmationPage').style.display = 'none';
    document.getElementById('adCreatePage').style.display = 'none';
}

function showConfirmationPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registrationPage').style.display = 'none';
    document.getElementById('confirmationPage').style.display = 'block';
    document.getElementById('adCreatePage').style.display = 'none';
}

function showAdCreatePage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registrationPage').style.display = 'none';
    document.getElementById('confirmationPage').style.display = 'none';
    document.getElementById('adCreatePage').style.display = 'block';
}

// Обработчик формы логина
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
            localStorage.setItem('token', data.token);
            document.getElementById('loginMessage').textContent = "Успешный вход!";
            showAdCreatePage();
            await populateRegionList();
            await populateCategoryList();
            await loadSubcategories();
        } else {
            document.getElementById('loginMessage').textContent = `Ошибка: ${data.message}`;
        }
    } catch (error) {
        document.getElementById('loginMessage').textContent = `Ошибка: ${error.message}`;
    }
});

// Обработчик формы регистрации
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const telegram = document.getElementById('telegram').value;
    const whatsapp = document.getElementById('whatsapp').value;

    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, phoneNumber, firstName, lastName, telegram, whatsapp })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('registrationMessage').textContent = "Регистрация успешна! Проверьте почту для подтверждения.";
            showConfirmationPage();
        } else {
            document.getElementById('registrationMessage').textContent = `Ошибка: ${data.message}`;
        }
    } catch (error) {
        document.getElementById('registrationMessage').textContent = `Ошибка: ${error.message}`;
    }
});

// Обработчик формы подтверждения email
document.getElementById('confirmationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('regEmail').value;
    const confirmationCode = document.getElementById('confirmationCode').value;

    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/user/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, confirmationCode })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('confirmationMessage').textContent = "Email подтвержден!";
            localStorage.setItem('token', data.token);
            showAdCreatePage();
        } else {
            document.getElementById('confirmationMessage').textContent = `Ошибка: ${data.message}`;
        }
    } catch (error) {
        document.getElementById('confirmationMessage').textContent = `Ошибка: ${error.message}`;
    }
});

// Функция выхода
function logout() {
    localStorage.removeItem('token');
    showLoginPage();
    document.getElementById('loginMessage').textContent = "Вы вышли из аккаунта.";
}

document.getElementById('adForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const formData = new FormData(document.getElementById('adForm'));

    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/ad/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('adMessage').textContent = "Объявление успешно добавлено!";
            document.getElementById('adForm').reset();
        } else {
            document.getElementById('adMessage').textContent = `Ошибка: ${data.message}`;
        }
    } catch (error) {
        document.getElementById('adMessage').textContent = `Ошибка: ${error.message}`;
    }
});

async function populateRegionList() {
    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/region');
        if (response.ok) {
            const regions = await response.json();
            const regionSelect = document.getElementById('regionId');
            regionSelect.innerHTML = regions
                .map(region => `<option value="${region.id}">${region.regionName}</option>`)
                .join('');
        }
    } catch (error) {
        console.error('Ошибка при загрузке регионов:', error);
    }
}

async function populateCategoryList() {
    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/category');
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('categoryId');
            categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.categoryName;
                categorySelect.appendChild(option);
            });

            categorySelect.addEventListener('change', filterSubcategories);
        }
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
    }
}

let allSubcategories = [];

async function loadSubcategories() {
    try {
        const response = await fetch('https://apsnybillboard-production.up.railway.app/api/subcategory');
        if (response.ok) {
            allSubcategories = await response.json();
        }
    } catch (error) {
        console.error('Ошибка при загрузке подкатегорий:', error);
    }
}

function filterSubcategories() {
    const categoryId = document.getElementById('categoryId').value;
    const subcategorySelect = document.getElementById('subcategoryId');
    subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option>';

    const filteredSubcategories = allSubcategories.filter(sub => sub.categoryId == categoryId);
    filteredSubcategories.forEach(subcategory => {
        const option = document.createElement('option');
        option.value = subcategory.id;
        option.textContent = subcategory.subcategoryName;
        subcategorySelect.appendChild(option);
    });
}

