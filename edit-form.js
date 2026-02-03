// ========== ОБЩИЕ ФУНКЦИИ ДЛЯ ХРАНЕНИЯ ДАННЫХ ==========

// Сохраняем данные формы в localStorage
function saveFormDataForEditing(formData) {
    try {
        const saveData = {
            ...formData,
            timestamp: Date.now(),
            lastEdited: new Date().toLocaleString('ru-RU'),
            saved_from: 'edit_form'
        };
        
        const key = `wedding_form_data_${formData.unique_code}`;
        localStorage.setItem(key, JSON.stringify(saveData));
        
        console.log('💾 Данные формы сохранены для редактирования:', key);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения данных формы:', error);
        return false;
    }
}

// Получаем данные формы по коду
function getFormDataByCode(code) {
    try {
        // Пробуем несколько форматов ключей
        const key1 = `wedding_form_data_${code}`;
        const key2 = `wedding_form_data_${decodeURIComponent(code)}`;
        
        let data = localStorage.getItem(key1);
        if (!data) {
            data = localStorage.getItem(key2);
        }
        
        if (data) {
            const parsed = JSON.parse(data);
            console.log('📥 Данные найдены по ключу:', data ? key1 : key2);
            return parsed;
        }
        
        console.log('🔍 Данные не найдены, проверяемые ключи:', key1, key2);
        return null;
    } catch (error) {
        console.error('❌ Ошибка получения данных формы:', error);
        return null;
    }
}

// ========== РЕДАКТИРОВАНИЕ ФОРМЫ ==========

// Глобальные переменные для edit.html
let editForm = null;
let editNameInput = null;
let editPhoneInput = null;
let editForWhoRadios = null;
let editGuestsNamesContainer = null;
let editGuestsNamesTextarea = null;
let editDrinksSingleContainer = null;
let editDrinksMultipleContainer = null;
let editDrinksSingle = null;
let editDrinksMultiple = null;
let editStaySelect = null;
let editCarSelect = null;
let editTrackInput = null;
let editCommentsTextarea = null;
let editUniqueCodeInput = null;

// Получение кода из URL
function getCodeFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        
        if (code) {
            // Декодируем URL-encoded символы
            code = decodeURIComponent(code);
            console.log('🔑 Код из URL:', code);
            return code;
        }
        
        console.error('❌ Код не найден в URL');
        return null;
    } catch (error) {
        console.error('❌ Ошибка при получении кода из URL:', error);
        return null;
    }
}

// Загрузка данных формы
function loadFormData(code) {
    console.log('📥 Загружаем данные для кода:', code);
    
    try {
        // Пробуем получить из localStorage
        const data = getFormDataByCode(code);
        
        if (data) {
            console.log('✅ Данные найдены:', data);
            return data;
        }
        
        console.log('❌ Данные не найдены в localStorage');
        return null;
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        return null;
    }
}

// Заполнение формы данными
function populateFormWithData(formData) {
    console.log('📝 Заполняем форму данными:', formData);
    
    if (!formData) return false;
    
    try {
        // Основные поля
        if (editNameInput) editNameInput.value = formData.name || '';
        if (editPhoneInput) editPhoneInput.value = formData.phone || '';
        if (editTrackInput) editTrackInput.value = formData.track || '';
        if (editCommentsTextarea) editCommentsTextarea.value = formData.comments || '';
        if (editUniqueCodeInput) editUniqueCodeInput.value = formData.unique_code || '';
        
        // Определяем "За кого"
        const isFamily = formData.for_who === 'Семья/компания';
        const forWhoValue = isFamily ? 'family' : 'self';
        
        if (editForWhoRadios) {
            editForWhoRadios.forEach(radio => {
                if (radio.value === forWhoValue) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            });
        }
        
        // Имена гостей (если семья)
        if (isFamily && editGuestsNamesTextarea && formData.guests_names) {
            editGuestsNamesTextarea.value = formData.guests_names;
        }
        
        // Напитки
        if (isFamily && editDrinksMultiple && formData.drinks) {
            // Для multiple select
            const drinksArray = formData.drinks.split(',').map(d => d.trim());
            Array.from(editDrinksMultiple.options).forEach(option => {
                option.selected = drinksArray.includes(option.text);
            });
        } else if (!isFamily && editDrinksSingle && formData.drinks) {
            // Для single select
            const optionToSelect = Array.from(editDrinksSingle.options).find(
                option => option.text === formData.drinks
            );
            if (optionToSelect) {
                editDrinksSingle.value = optionToSelect.value;
            }
        }
        
        // Ночевка и авто
        if (editStaySelect && formData.stay) {
            const stayOption = Array.from(editStaySelect.options).find(
                option => option.text === formData.stay || option.value === formData.stay
            );
            if (stayOption) {
                editStaySelect.value = stayOption.value;
            }
        }
        
        if (editCarSelect && formData.car) {
            const carOption = Array.from(editCarSelect.options).find(
                option => option.text === formData.car || option.value === formData.car
            );
            if (carOption) {
                editCarSelect.value = carOption.value;
            }
        }
        
        console.log('✅ Форма заполнена данными');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка заполнения формы:', error);
        return false;
    }
}

// Функции обновления опций (аналогичные main форме)
function updateEditCarOptions(isFamily) {
    if (!editCarSelect) return;
    
    const currentValue = editCarSelect.value;
    
    if (isFamily) {
        editCarSelect.innerHTML = `
            <option value="" selected>Выберите вариант</option>
            <option value="Да">Да, все на одном авто</option>
            <option value="Да, несколько">Приедем на двух авто</option>
            <option value="Нет">Нет</option>
            <option value="Позже">Решим позже</option>
            <option value="Свой вариант">Свой вариант (распишу в комментарии)</option>
        `;
    } else {
        editCarSelect.innerHTML = `
            <option value="" selected>Выберите вариант</option>
            <option value="Да">Да</option>
            <option value="Нет">Нет</option>
            <option value="Позже">Решу позже</option>
            <option value="Свой вариант">Свой вариант (распишу в комментарии)</option>
        `;
    }
    
    if (currentValue) {
        const optionToSelect = editCarSelect.querySelector(`option[value="${currentValue}"]`);
        if (optionToSelect) {
            optionToSelect.selected = true;
        }
    }
}

function updateEditStayOptions(isFamily) {
    if (!editStaySelect) return;
    
    const currentValue = editStaySelect.value;

     // ДВА ПОЛНЫХ НАБОРА ТЕКСТОВ
    const familyOptions = {
        'Остаюсь': 'Остаёмся',
        'Ночую дома, но приеду на следующий день': 'Ночуем дома, но приедем на следующий день',
        'Приеду только на 1й день': 'Приедем только на 1й день',
        'Позже': 'Решим позже насчёт ночёвки',
        'Не смогу посетить мероприятие': 'Не сможем посетить мероприятие',
        'Свой вариант': 'Свой вариант (распишу в комментарии)'
    };
    
    const selfOptions = {
        'Остаюсь': 'Остаюсь',
        'Ночую дома, но приеду на следующий день': 'Ночую дома, но приеду на следующий день',
        'Приеду только на 1й день': 'Приеду только на первый день',
        'Позже': 'Решу позже насчёт ночёвки',
        'Не смогу посетить мероприятие': 'Не смогу посетить мероприятие',
        'Свой вариант': 'Свой вариант (распишу в комментарии)'
    };

    // ВЫБИРАЕМ НУЖНЫЙ НАБОР
    const optionsToUse = isFamily ? familyOptions : selfOptions;
    
   // ОБНОВЛЯЕМ ВСЕ ОПЦИИ
    editStaySelect.querySelectorAll('option').forEach(option => {
        const originalValue = option.value;
        
        if (optionsToUse[originalValue]) {
            option.textContent = optionsToUse[originalValue];
        }
    });
        
// ВОССТАНАВЛИВАЕМ ВЫБРАННОЕ ЗНАЧЕНИЕ
    if (currentValue) {
        const optionToSelect = editStaySelect.querySelector(`option[value="${currentValue}"]`);
        if (optionToSelect) {
            optionToSelect.selected = true;
        }
    }
}

// Инициализация формы редактирования
function initEditForm() {
    console.log('✏️ Инициализация формы редактирования...');
    
    // Инициализируем переменные
    editForm = document.getElementById('edit-guest-form');
    editNameInput = document.getElementById('edit-name');
    editPhoneInput = document.getElementById('edit-phone');
    editForWhoRadios = document.querySelectorAll('input[name="for-who"]');
    editGuestsNamesContainer = document.getElementById('edit-guests-names-container');
    editGuestsNamesTextarea = document.getElementById('edit-guests-names');
    editDrinksSingleContainer = document.getElementById('edit-drinks-single-container');
    editDrinksMultipleContainer = document.getElementById('edit-drinks-multiple-container');
    editDrinksSingle = document.getElementById('edit-drinks-single');
    editDrinksMultiple = document.getElementById('edit-drinks-multiple');
    editStaySelect = document.getElementById('edit-stay');
    editCarSelect = document.getElementById('edit-car');
    editTrackInput = document.getElementById('edit-track');
    editCommentsTextarea = document.getElementById('edit-comments');
    editUniqueCodeInput = document.getElementById('edit-unique-code');
    
    // Проверяем элементы
    if (!editForm) {
        console.error('❌ Форма редактирования не найдена');
        showError('Форма не найдена на странице');
        return;
    }
    
    // Получаем код из URL
    const code = getCodeFromURL();
    
    if (!code) {
        showError('Неверная или устаревшая ссылка для редактирования');
        return;
    }
    
    // Загружаем данные
    const formData = loadFormData(code);
    
    if (!formData) {
        showError('Не удалось загрузить ваши данные. Возможно, они были удалены или ссылка устарела.');
        return;
    }
    
    // Скрываем загрузку, показываем форму
    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('edit-form-container').style.display = 'block';
    
    // Заполняем форму данными
    const success = populateFormWithData(formData);
    
    if (!success) {
        showError('Ошибка при загрузке данных формы');
        return;
    }
    
    // Настраиваем обработчики переключения
    if (editForWhoRadios && editForWhoRadios.length > 0) {
        editForWhoRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const isFamily = this.value === 'family';
                
                // Показываем/скрываем элементы
                if (editGuestsNamesContainer) {
                    editGuestsNamesContainer.style.display = isFamily ? 'block' : 'none';
                    editGuestsNamesTextarea.required = isFamily;
                }
                
                // Переключаем напитки
                if (editDrinksSingleContainer) editDrinksSingleContainer.style.display = isFamily ? 'none' : 'block';
                if (editDrinksMultipleContainer) editDrinksMultipleContainer.style.display = isFamily ? 'block' : 'none';
                
                // Обновляем обязательность полей
                if (editDrinksSingle) editDrinksSingle.required = !isFamily;
                if (editDrinksMultiple) editDrinksMultiple.required = isFamily;
                
                // Обновляем опции
                updateEditCarOptions(isFamily);
                updateEditStayOptions(isFamily);
            });
        });
    }
    
    // Настраиваем отправку формы
    setupEditFormSubmitHandler();
    
    console.log('✅ Форма редактирования инициализирована');
}

// Отслеживаем изменения в форме (после её загрузки)
editForm = document.getElementById('edit-guest-form');
const saveButton = editForm.querySelector('button[type="submit"]');
let isFormChanged = false;

// Функция для разблокировки кнопки при изменениях
function enableSaveButtonIfChanged() {
    if (saveButton && saveButton.disabled && !isFormChanged) {
        saveButton.disabled = false;
        saveButton.style.background = ''; // Возвращаем оригинальный цвет
        saveButton.style.cursor = '';
        saveButton.textContent = 'Сохранить изменения';
        isFormChanged = true;
    }
}

// Слушаем изменения во всех полях формы
editForm.addEventListener('input', enableSaveButtonIfChanged);
editForm.addEventListener('change', enableSaveButtonIfChanged);

// Настройка обработчика отправки
function setupEditFormSubmitHandler() {
    if (!editForm) return;
    
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;
        
        try {
            // Собираем данные
            const formData = collectEditFormData();
            
            // Валидация
            if (!validateEditFormData(formData)) {
                alert('❌ Пожалуйста, заполните все обязательные поля (*)');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Отправка на Formspree (с пометкой что это редактирование)
            const response = await sendEditToFormspree(formData);
            
            if (response.ok) {
                // Сохраняем обновленные данные
                saveFormDataForEditing(formData);
                
                 // 1. Показываем сообщение об успехе
    const successMessage = document.getElementById('edit-success-message');
    if (successMessage) {
        successMessage.style.display = 'block';

        // Прокручиваем к сообщению
        setTimeout(() => {
            successMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 300);
    }
    
    // 2. Блокируем форму
    const formFields = editForm.querySelectorAll('input, select, textarea');
formFields.forEach(field => {
    field.classList.add('submitted-field'); // Только CSS-класс
    // НЕ делаем field.disabled = true;
});
    
    // 3. Кнопка "Сохранить изменения" становится disabled
    saveButton = editForm.querySelector('button[type="submit"]');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.classList.add('submitted-button');
    }

    // 4. Добавляем обработчик для разблокировки кнопки при изменениях
editForm.addEventListener('input', function() {
    if (saveButton && saveButton.disabled) {
        saveButton.disabled = false;
        saveButton.classList.remove('submitted-button');
    }
}); 
                
            } else {
                throw new Error('Ошибка отправки изменений');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения изменений. Попробуйте еще раз.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Сбор данных формы редактирования
function collectEditFormData() {
    const isFamily = document.querySelector('input[name="for-who"]:checked')?.value === 'family';
    
    const data = {
        name: editNameInput ? editNameInput.value.trim() : '',
        phone: editPhoneInput ? editPhoneInput.value.trim() : '',
        for_who: isFamily ? 'Семья/компания' : 'Себя',
        drinks: '',
        stay: editStaySelect ? editStaySelect.value : '',
        car: editCarSelect ? editCarSelect.value : '',
        track: editTrackInput ? editTrackInput.value.trim() : '',
        comments: editCommentsTextarea ? editCommentsTextarea.value.trim() : '',
        unique_code: editUniqueCodeInput ? editUniqueCodeInput.value : '',
        is_edit: true, // Пометка что это редактирование
        edit_timestamp: Date.now(),
        original_code: getCodeFromURL() // Сохраняем оригинальный код
    };
    
    // Обработка напитков
    if (isFamily && editDrinksMultiple) {
        const selectedOptions = Array.from(editDrinksMultiple.selectedOptions)
            .map(opt => opt.text);
        data.drinks = selectedOptions.join(', ');
    } else if (!isFamily && editDrinksSingle) {
        data.drinks = editDrinksSingle.options[editDrinksSingle.selectedIndex]?.text || '';
    }
    
    // Обработка дополнительных гостей
    if (isFamily && editGuestsNamesTextarea && editGuestsNamesTextarea.value.trim()) {
        data.guests_names = editGuestsNamesTextarea.value.trim();
    }
    
    // Проверка на "Решу позже"
    data.has_later = 
        (editDrinksSingle && editDrinksSingle.value === 'Позже') ||
        (editDrinksMultiple && Array.from(editDrinksMultiple.selectedOptions).some(opt => opt.value === 'Позже')) ||
        (editCarSelect && editCarSelect.value === 'Позже') ||
        (editStaySelect && editStaySelect.value === 'Позже');
    
    return data;
}

// Валидация данных редактирования
function validateEditFormData(data) {
    if (!data.name || !data.phone) return false;
    
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(data.phone)) return false;
    
    const isFamily = document.querySelector('input[name="for-who"]:checked')?.value === 'family';
    if (isFamily && (!data.guests_names || data.guests_names.trim().length < 2)) {
        return false;
    }
    
    return true;
}

// Отправка редактирования на Formspree
async function sendEditToFormspree(formData) {
    const guestList = formData.guests_names ? 
        `\nСостав гостей:\n${formData.guests_names.replace(/,/g, '\n')}` : 
        '\nКоличество: 1 гость';
    
    const messageText = `
ОБНОВЛЕННАЯ ЗАЯВКА НА СВАДЕБНУЮ ВЕЧЕРИНКУ!

ОТРЕДАКТИРОВАЛ(А): ${formData.name}
ТЕЛЕФОН: ${formData.phone}
ЗАПОЛНЕНО ЗА: ${formData.for_who}
${guestList}

ОБНОВЛЕННЫЕ ОТВЕТЫ:
• Напитки: ${formData.drinks}
• Ночевка: ${formData.stay}
• Авто: ${formData.car}
• Любимый трек: ${formData.track || 'не указано'}
${formData.comments ? `• Комментарии: ${formData.comments}` : ''}

УНИКАЛЬНЫЙ КОД: ${formData.unique_code}
ОТПРАВЛЕНО: ${new Date().toLocaleString('ru-RU')}
ТИП: РЕДАКТИРОВАНИЕ`;

    return await fetch('https://formspree.io/f/mbdlvbkg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            _subject: `ОБНОВЛЕНИЕ заявки от ${formData.name}`,
            _replyto: 'katerine.abramova@gmail.com',
            
            "Заполнил(а)": formData.name,
            "Телефон": formData.phone,
            "Заполнено за": formData.for_who,
            "Состав гостей": formData.guests_names || '1 гость',
            "Что будут пить": formData.drinks,
            "Ночевка": formData.stay,
            "Авто": formData.car,
            "Любимый трек": formData.track || 'не указано',
            "Комментарии": formData.comments || '',
            "Уникальный код": formData.unique_code,
            "Тип заявки": "Редактирование",
            
            message: messageText
        })
    });
}

// Показать ошибку
function showError(message) {
    console.error('❌ Ошибка:', message);
    
    document.getElementById('loading-message').style.display = 'none';
    
    const errorElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('✏️ Страница редактирования загружена');
    
    // Инициализируем меню (если есть функция из основного скрипта)
    if (typeof initHamburgerMenu === 'function') {
        initHamburgerMenu();
    }
    
    // Запускаем инициализацию формы с небольшой задержкой
    setTimeout(initEditForm, 100);
});
