<?php

use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

require __DIR__ . '/vendor/autoload.php';

// Завантаження .env
function loadEnv($path)
{
    if (!file_exists($path)) {
        return false;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

loadEnv(__DIR__ . '/.env');

// Перевірка методу запиту
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Метод не дозволений']);
    exit;
}

// Отримання даних з форми з валідацією
function sanitizeInput($data)
{
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function validateRequired($value, $fieldName)
{
    if (empty($value)) {
        throw new Exception("Поле '$fieldName' є обов'язковим");
    }
}

function validateEmail($email)
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Невірний формат email адреси");
    }
}

function validateName($name)
{
    if (!preg_match("/^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ\s'-]{2,50}$/u", $name)) {
        throw new Exception("Ім'я містить недозволені символи або має невірну довжину");
    }
}

function validatePhone($phone)
{
    if (!preg_match("/^\+?[0-9\s\-()]{7,20}$/", $phone)) {
        throw new Exception("Невірний формат номера телефону");
    }
}

try {
    // Отримання та валідація даних
    $fullName = sanitizeInput($_POST['fullname'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $country = sanitizeInput($_POST['country'] ?? '');
    $service = sanitizeInput($_POST['service'] ?? '');
    $additionalInfo = sanitizeInput($_POST['additional_info'] ?? '');
    $agreement = isset($_POST['agreement']) ? true : false;

    // Валідація обов'язкових полів
    validateRequired($fullName, "Повне ім'я");
    validateRequired($email, "Email");
    validateRequired($phone, "Телефон");
    validateRequired($country, "Країна проживання");
    validateRequired($service, "Послуга");

    // Спеціальна валідація
    validateName($fullName);
    validateEmail($email);
    validatePhone($phone);
    validateName($country);

    // Перевірка згоди на обробку даних
    if (!$agreement) {
        throw new Exception("Необхідно надати згоду на обробку персональних даних");
    }

    // Валідація послуги
    $allowedServices = ['consulting', 'development', 'design', 'marketing'];
    if (!in_array($service, $allowedServices)) {
        throw new Exception("Обрано невірну послугу");
    }

    // Переклад назв послуг
    $serviceNames = [
        'consulting' => 'Консалтинг',
        'development' => 'Розробка',
        'design' => 'Дизайн',
        'marketing' => 'Маркетинг'
    ];

    // Формування тексту листа
    $text = "Нова заявка з сайту:\n\n";
    $text .= "Повне ім'я: $fullName\n";
    $text .= "Email: $email\n";
    $text .= "Телефон/WhatsApp: $phone\n";
    $text .= "Країна проживання: $country\n";
    $text .= "Обрана послуга: " . $serviceNames[$service] . "\n";

    if (!empty($additionalInfo)) {
        $text .= "Додаткова інформація: $additionalInfo\n";
    }

    $text .= "\nЗгода на обробку персональних даних: " . ($agreement ? 'Так' : 'Ні') . "\n";
    $text .= "Дата подачі заявки: " . date('Y-m-d H:i:s') . "\n";

    // HTML версія листа для кращого відображення
    $htmlText = "
    <h2>Нова заявка з сайту</h2>
    <table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; font-family: Arial, sans-serif;'>
        <tr><td><strong>Повне ім'я:</strong></td><td>$fullName</td></tr>
        <tr><td><strong>Email:</strong></td><td><a href='mailto:$email'>$email</a></td></tr>
        <tr><td><strong>Телефон/WhatsApp:</strong></td><td><a href='tel:$phone'>$phone</a></td></tr>
        <tr><td><strong>Країна проживання:</strong></td><td>$country</td></tr>
        <tr><td><strong>Обрана послуга:</strong></td><td>" . $serviceNames[$service] . "</td></tr>";

    if (!empty($additionalInfo)) {
        $htmlText .= "<tr><td><strong>Додаткова інформація:</strong></td><td>" . nl2br($additionalInfo) . "</td></tr>";
    }

    $htmlText .= "
        <tr><td><strong>Згода на обробку даних:</strong></td><td>" . ($agreement ? 'Так' : 'Ні') . "</td></tr>
        <tr><td><strong>Дата подачі заявки:</strong></td><td>" . date('Y-m-d H:i:s') . "</td></tr>
    </table>
    ";

    // Конфігурація Mailtrap
    $apiKey = "ff2c9848be7cddad16a4b15781aade14";
    $toEmail = "aktvink899@gmail.com";
    $fromEmail = "aktvink899@gmail.com";

    if (!$apiKey || !$toEmail || !$fromEmail) {
        // Вивід значень для налагодження
        throw new Exception("Помилка конфігурації email сервісу");
    }


    $mailtrap = MailtrapClient::initSendingEmails(
        apiKey: $apiKey                     // твій токен із “Email Sending API”
    );

    $email = (new MailtrapEmail())
        ->from(new Address('no-reply@your-domain.com', 'Форма сайту')) // ⚠️ домен має бути
        ->to(new Address($toEmail))
        ->subject("Нова заявка від $fullName – $serviceNames[$service]")
        ->text($text)
        ->html($htmlText)
        ->category('Заявки');

    $response = $mailtrap->send($email);
    $result = ResponseHelper::toArray($response);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Заявку успішно надіслано! Ми зв\'яжемося з вами найближчим часом.'
    ]);

} catch (Exception $e) {
    // Обробка помилок
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Помилка: ' . $e->getMessage()
    ]);

    // Логування помилки (опціонально)
    error_log("Form submission error: " . $e->getMessage() . " - " . print_r($_POST, true));
}