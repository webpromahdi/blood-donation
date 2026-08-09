<?php
require_once __DIR__ . '/../../config/cors.php';
session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAuth(['admin']);

$database = new Database();
$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    
    if (empty($name)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Name is required']);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?");
        $stmt->execute([$name, $phone, $_SESSION['user_id']]);
        
        // Update session
        $_SESSION['name'] = $name;
        $_SESSION['phone'] = $phone;
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully', 'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['name'],
            'email' => $_SESSION['email'],
            'phone' => $_SESSION['phone'],
            'role' => $_SESSION['role']
        ]]);
    } catch (PDOException $e) {
        error_log("Update admin profile error: " . $e->getMessage());
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Password update
    $data = json_decode(file_get_contents('php://input'), true);
    $current_password = $data['current_password'] ?? '';
    $new_password = $data['new_password'] ?? '';
    
    if (empty($current_password) || empty($new_password)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Passwords are required']);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($current_password, $user['password'])) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit;
        }
        
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashed, $_SESSION['user_id']]);
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } catch (PDOException $e) {
        error_log("Update admin password error: " . $e->getMessage());
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update password']);
    }
} else {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
