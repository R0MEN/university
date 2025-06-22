document.addEventListener("DOMContentLoaded", function () {
	const phoneInputs = document.querySelectorAll("#phone");
	const forms = document.querySelectorAll("#orderForm");
	const openModals = document.querySelectorAll("#open-modal");
	const closeModal = document.getElementById("close-modal");
	const modal = document.querySelector(".modal")
	const body = document.body
	let isFocused = false; // Чи було натискання на інпут


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
	openModals.forEach(btn => {
		btn.addEventListener("click", () => {
			modal.classList.add("active")
			body.classList.add("active-modal")
		})
	})

	closeModal.addEventListener("click", () => {
		modal.classList.remove("active")
		body.classList.remove("active-modal")
	})

	phoneInputs.forEach(phoneInput => {
		phoneInput.addEventListener("focus", function () {
			if (!isFocused) {
				phoneInput.value = "+38 (";
				isFocused = true;
			}
		});

		phoneInput.addEventListener("input", (event) => formatPhoneNumber(event, phoneInput));
		phoneInput.addEventListener("keydown", (event) => preventDelete(event, phoneInput));
	})

	forms.forEach(form => {
		form.addEventListener("submit", sendMessage);
	})

	function formatPhoneNumber(event, phoneInput) {
		let value = phoneInput.value.replace(/\D/g, ""); // Видаляємо всі нецифрові символи
		if (value.startsWith("38")) {
			value = value.slice(2); // Видаляємо "38", якщо вже введено
		}

		if (value.length > 10) {
			value = value.substring(0, 10); // Обмежуємо введення до 10 цифр після "+38 ("
		}

		let formatted = "+38 (";
		if (value.length > 0) formatted += value.substring(0, 3);
		if (value.length > 3) formatted += ") " + value.substring(3, 7);
		if (value.length > 7) formatted += " " + value.substring(7, 10);

		phoneInput.value = formatted;
	}

	function preventDelete(event, phoneInput) {
		if ((event.key === "Backspace" || event.key === "Delete") && phoneInput.value.length <= 5) {
			event.preventDefault(); // Забороняємо стирання "+38 ("
		}
	}

	async function sendMessage(event) {
		event.preventDefault();

		let phoneInput = event.target.querySelector("#phone")

		if (phoneInput.value.length < 18) { // Повний формат "+38 (XXX) XXXX XXX"
			alert("Будь ласка, введіть повний номер телефону!");
			return
		}

		const form = event.target;
		const formData = new FormData(form);
		const resultElement = form.querySelector('p.form-message');
		resultElement.style.display = "block"

		try {
			const response = await fetch('/form.php', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				resultElement.style.display = "block"
				form.reset();
				setTimeout(() => {
					resultElement.style.display = "none"
				}, 3000)
			} else {
				resultElement.textContent = `Попробуйте ще раз...`;
			}
		} catch (error) {
			form.reset();
			resultElement.style.display = "block"
			resultElement.textContent = `Попробуйте ще раз...`;
			setTimeout(() => {
				resultElement.style.display = "none"
			}, 3000)
		}
	}
});

