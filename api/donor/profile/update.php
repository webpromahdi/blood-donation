<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth(['donor']);
$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();
if (!$conn) { http_response_code(500); echo json_encode(['success' => false, 'message' => 'DB error']); exit; }

try {
    $userFields = []; $userParams = [];
    if (!empty($input['name'])) { $userFields[] = 'name = ?'; $userParams[] = trim($input['name']); }
    if (!empty($input['phone'])) { $userFields[] = 'phone = ?'; $userParams[] = trim($input['phone']); }
    if (!empty($userFields)) { $userParams[] = $userId; $conn->prepare('UPDATE users SET ' . implode(', ', $userFields) . ' WHERE id = ?')->execute($userParams); }

    $donorFields = []; $donorParams = [];
    if (isset($input['city'])) { $donorFields[] = 'city = ?'; $donorParams[] = trim($input['city']); }
    if (isset($input['address'])) { $donorFields[] = 'address = ?'; $donorParams[] = trim($input['address']); }
    if (isset($input['gender'])) { $donorFields[] = 'gender = ?'; $donorParams[] = trim($input['gender']); }
    if (isset($input['is_available'])) { $donorFields[] = 'is_available = ?'; $donorParams[] = (int)$input['is_available']; }
    if (!empty($donorFields)) { $donorParams[] = $userId; $conn->prepare('UPDATE donors SET ' . implode(', ', $donorFields) . ' WHERE user_id = ?')->execute($donorParams); }

    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} catch (PDOException $e) {
    error_log('Profile Update Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}
