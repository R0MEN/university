const burgerBtn = document.querySelector(".burger");
const headerNav = document.querySelector(".header__menu");
const body = document.querySelector("body");

burgerBtn.addEventListener("click", toggleBurgersClasses);

// Обробка кліків на посилання
headerNav.addEventListener("click", (event) => {
	let clickedLink = event.target.closest("a");

	if (clickedLink) {
		closeMenu();
	}
});

// Змінні для виявлення свайпу
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;

// Відстеження початку дотику
headerNav.addEventListener("touchstart", (event) => {
	touchStartX = event.changedTouches[0].screenX;
	touchStartY = event.changedTouches[0].screenY;
	isSwiping = false;
});

// Відстеження руху дотику - визначаємо, що це свайп
headerNav.addEventListener("touchmove", (event) => {
	isSwiping = true;
	touchEndX = event.changedTouches[0].screenX;
	touchEndY = event.changedTouches[0].screenY;
});

// Обробка закінчення дотику
headerNav.addEventListener("touchend", (event) => {
	// Перевіряємо, чи був рух (свайп), а не просто клік
	if (isSwiping) {
		handleSwipeGesture();
	}
	// Скидаємо прапор свайпу
	isSwiping = false;
});

function handleSwipeGesture() {
	const horizontalDistance = touchStartX - touchEndX;
	const verticalDistance = Math.abs(touchStartY - touchEndY);

	if (horizontalDistance > 70 && horizontalDistance > verticalDistance) {
		console.log("Свайп виявлено, закриваємо меню");
		closeMenu();
	}
}

function toggleBurgersClasses() {
	burgerBtn.classList.toggle("active");
	headerNav.classList.toggle("active");
	body.classList.toggle("active-modal");
}

function closeMenu() {
	burgerBtn.classList.remove("active");
	headerNav.classList.remove("active");
	body.classList.remove("active-modal");
}