<?php

use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

require __DIR__ . '/vendor/autoload.php';

// Завантаження .env (не обов'язково, але гарна практика)
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

loadEnv(__DIR__ . '/../.env');

$apiKey = getenv('MAILTRAP_API_TOKEN'); // твій токен з .env
$toEmail = getenv('MAILTRAP_TO_EMAIL'); // кому надсилати
$fromEmail = getenv('MAILTRAP_FROM_EMAIL'); // від кого (повинен бути схвалений у Mailtrap)

$name = isset($_POST['username']) ? $_POST['username'] : 'Не вказано';
$phone = isset($_POST['phone']) ? $_POST['phone'] : 'Не вказано';

$text = "Заявка з сайту:\n\n";
$text .= "Ім’я: $name\n";
$text .= "Телефон: $phone\n";

// Ініціалізація Mailtrap API
$mailtrap = MailtrapClient::initSendingEmails(
    apiKey: $apiKey,
);

// Формування листа
$email = (new MailtrapEmail())
    ->from(new Address($fromEmail, 'Форма сайту'))
    ->to(new Address($toEmail))
    ->subject('Нова заявка з сайту')
    ->text($text)
    ->category('Заявки');

// Надсилання
try {
    $response = $mailtrap->send($email);
    $result = ResponseHelper::toArray($response);
    echo 'Лист успішно надіслано.';
} catch (Exception $e) {
    echo 'Помилка при надсиланні: ' . $e->getMessage();
}
