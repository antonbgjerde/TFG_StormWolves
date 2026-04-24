<?php
require_once __DIR__ . '/config.php';

function getDb() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'No se puede conectar a la base de datos.']);
        exit;
    }

    return $pdo;
}

function sendVerificationEmail($email, $username, $token) {
    $verifyLink = BASE_URL . '/verify.php?token=' . urlencode($token);
    $subject = EMAIL_SUBJECT;
    $message = "<html><body>" .
        "<p>Hola <strong>{$username}</strong>,</p>" .
        "<p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>" .
        "<p><a href='{$verifyLink}'>Verificar cuenta</a></p>" .
        "<p>Si no solicitaste este registro, ignora este mensaje.</p>" .
        "</body></html>";

    $headers = "From: " . EMAIL_FROM . "\r\n" .
               "MIME-Version: 1.0\r\n" .
               "Content-type: text/html; charset=UTF-8\r\n";

    return mail($email, $subject, $message, $headers);
}
