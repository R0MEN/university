document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('contactForm');
	if (!form) {
		console.error('Form not found');
		return;
	}

	form.addEventListener('submit', async function (e) {
		e.preventDefault();

		const submitBtn = form.querySelector('.submit-btn');
		const messageDiv = document.getElementById('message');
		const normalText = submitBtn.querySelector('.normal-text');
		const loadingText = submitBtn.querySelector('.loading');

		// Показати стан завантаження
		submitBtn.disabled = true;
		normalText.style.display = 'none';
		loadingText.style.display = 'inline';
		messageDiv.style.display = 'none';

		try {
			const formData = new FormData(form);

			// Для тестування без PHP сервера
			if (window.location.protocol === 'file:' || window.location.port === '5500') {
				// Mock відповідь для тестування
				setTimeout(() => {
					messageDiv.textContent = 'Тестовий режим: Форма заповнена правильно!';
					messageDiv.className = 'message success';
					messageDiv.style.display = 'block';
					form.reset();

					submitBtn.disabled = false;
					normalText.style.display = 'inline';
					loadingText.style.display = 'none';
				}, 1000);
				return;
			}

			const response = await fetch('form.php', {
				method: 'POST',
				body: formData
			});

			let result;
			const contentType = response.headers.get('content-type');

			if (contentType && contentType.includes('application/json')) {
				result = await response.json();
			} else {
				// Якщо відповідь не JSON, обробити як текст
				const text = await response.text();
				result = {
					success: response.ok,
					message: text || 'Неочікувана помилка сервера'
				};
			}

			// Показати повідомлення
			messageDiv.textContent = result.message;
			messageDiv.className = result.success ? 'message success' : 'message error';
			messageDiv.style.display = 'block';

			// Якщо успішно, очистити форму
			if (result.success) {
				form.reset();
			}

		} catch (error) {
			messageDiv.textContent = 'Виникла помилка при відправці форми. Спробуйте ще раз.';
			messageDiv.className = 'message error';
			messageDiv.style.display = 'block';
			console.error('Form submission error:', error);
		} finally {
			// Відновити кнопку
			submitBtn.disabled = false;
			normalText.style.display = 'inline';
			loadingText.style.display = 'none';
		}
	});

	// Додаткова валідація для телефону
	const phoneInput = document.querySelector('input[name="phone"]');
	if (phoneInput) {
		phoneInput.addEventListener('input', function (e) {
			let value = e.target.value;
			// Дозволити тільки цифри, пробіли, дефіси, дужки та знак +
			value = value.replace(/[^0-9\s\-+()\u00A0]/g, '');
			e.target.value = value;
		});
	}

	// Обмеження для текстових полів (тільки літери)
	const nameFields = document.querySelectorAll('input[name="fullname"], input[name="country"]');
	nameFields.forEach(field => {
		field.addEventListener('input', function (e) {
			let value = e.target.value;
			// Дозволити тільки літери, пробіли, апострофи та дефіси
			value = value.replace(/[^A-Za-zА-Яа-яЁёІіЇїЄєҐґ\s'\-]/g, '');
			e.target.value = value;
		});
	});
});


