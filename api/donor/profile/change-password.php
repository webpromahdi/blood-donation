<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success' => false, 'message' => 'Method not allowed']); exit; }
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth(['donor', 'seeker', 'hospital', 'admin']);
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['current_password']) || empty($input['new_password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current and new password required']);
    exit;
}

$userId = $_SESSION['user_id'];
$database = new Database();
$conn = $database->getConnection();

try {
    $stmt = $conn->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($input['current_password'], $row['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }
    $hash = password_hash($input['new_password'], PASSWORD_DEFAULT);
    $conn->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hash, $userId]);
    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
} catch (PDOException $e) {
    error_log('Password Update Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update password']);
}
