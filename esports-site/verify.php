<?php
require_once __DIR__ . '/db.php';

$token = $_GET['token'] ?? '';
if (!$token) {
    echo '<h1>Token inválido</h1><p>El token de verificación no es válido.</p>';
    exit;
}

$pdo = getDb();
$stmt = $pdo->prepare('UPDATE users SET verified = 1, verification_token = NULL WHERE verification_token = :token');
$stmt->execute(['token' => $token]);

if ($stmt->rowCount() === 0) {
    echo '<h1>Token inválido</h1><p>El token ya no es válido o ya se ha utilizado.</p>';
    exit;
}

echo '<h1>Cuenta verificada</h1><p>Tu correo ha sido confirmado. Puedes volver a la página y entrar con tus datos.</p>';
