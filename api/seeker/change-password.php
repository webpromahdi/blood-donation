<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Seeker Change Password Endpoint
 * POST /api/seeker/change-password.php
 * 
 * Verifies current password and updates with new password.
 */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = requireAuth(['seeker', 'donor']); // Assuming donors might also use a similar setting, but restricted to seeker/donor here

$data = json_decode(file_get_contents("php://input"));
$currentPassword = $data->current_password ?? '';
$newPassword = $data->new_password ?? '';

if (empty($currentPassword) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Both current and new passwords are required']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters long']);
    exit;
}

$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Verify current password
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    if (!password_verify($currentPassword, $row['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Incorrect current password']);
        exit;
    }

    // Hash and update new password
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateStmt->execute([$newHash, $userId]);

    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
} catch (PDOException $e) {
    error_log("Password Change Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update password']);
}
