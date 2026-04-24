<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Solicitud inválida.']);
    exit;
}

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Debes enviar email y contraseña.']);
    exit;
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Correo o contraseña incorrectos.']);
    exit;
}

if (!$user['verified']) {
    http_response_code(403);
    echo json_encode(['error' => 'Debes verificar tu correo antes de iniciar sesión.']);
    exit;
}

if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Correo o contraseña incorrectos.']);
    exit;
}

$_SESSION['user'] = [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email'],
];

echo json_encode(['success' => true, 'message' => 'Inicio de sesión correcto.']);
