<?php
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

$botToken = getenv('TELEGRAM_BOT_TOKEN');
$chatId = getenv('CHAT_ID');

if (!$botToken || !$chatId) {
    die('Ошибка: не удалось получить токен или ID чата.');
}

$name = isset($_POST['username']) ? $_POST['username'] : 'Не має';
$phone = isset($_POST['phone']) ? $_POST['phone'] : 'Не має';

$text = "Заявка з сайту:\n\n";
$text .= "Імя: $name\n";
$text .= "Телефон: $phone\n";

$url = "https://api.telegram.org/bot$botToken/sendMessage?chat_id=$chatId&text=" . urlencode($text);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Ошибка cURL: ' . curl_error($ch);
} else {
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode == 200) {
        echo 'Сообщение успешно отправлено.';
    } else {
        echo 'Ошибка: не удалось отправить сообщение. Код ошибки: ' . $httpCode;
    }
}

curl_close($ch);
?>