<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Solicitud inválida.']);
    exit;
}

$username = trim($input['username'] ?? '');
$age = $input['age'] ?? '';
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$email || !$password || !$age) {
    http_response_code(400);
    echo json_encode(['error' => 'Debes completar todos los campos.']);
    exit;
}

$numericAge = filter_var($age, FILTER_VALIDATE_INT);
if ($numericAge === false || $numericAge < 13) {
    http_response_code(400);
    echo json_encode(['error' => 'Debes indicar una edad válida (13+).']);
    exit;
}

$pdo = getDb();

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email OR username = :username');
$stmt->execute(['email' => $email, 'username' => $username]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['error' => 'El correo o el nombre de usuario ya están en uso.']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$verificationToken = bin2hex(random_bytes(20));

$insert = $pdo->prepare('INSERT INTO users (username, email, age, password, verified, verification_token) VALUES (:username, :email, :age, :password, 0, :token)');
try {
    $insert->execute([
        'username' => $username,
        'email' => $email,
        'age' => $numericAge,
        'password' => $hashedPassword,
        'token' => $verificationToken,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo crear el usuario.']);
    exit;
}

if (!sendVerificationEmail($email, $username, $verificationToken)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo enviar el correo de verificación. Revisa la configuración de tu servidor de correo en PHP.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Usuario creado. Revisa tu correo para verificar tu cuenta.']);
