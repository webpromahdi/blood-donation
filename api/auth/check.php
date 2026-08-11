<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Session Check Endpoint
 * GET /api/auth/check.php
 * 
 * Check if user is currently logged in and return user info
 */

// CORS headers for frontend



require_once __DIR__ . '/../middleware/auth.php';

// Check if user is logged in using JWT
$user = checkAuth();

if ($user) {
    // Get user status from database for donors and hospitals
    $status = null;
    if (in_array($user['role'], ['donor', 'hospital'])) {
        require_once __DIR__ . '/../config/database.php';
        
        $database = new Database();
        $conn = $database->getConnection();
        
        if ($conn) {
            try {
                $stmt = $conn->prepare("SELECT status FROM users WHERE id = ?");
                $stmt->execute([$user['id']]);
                $result = $stmt->fetch();
                $status = $result ? $result['status'] : 'pending';
            } catch (PDOException $e) {
                error_log("Auth Check - Get Status Error: " . $e->getMessage());
                $status = 'pending';
            }
        }
    }

    // User is logged in
    echo json_encode([
        'success' => true,
        'logged_in' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name'],
            'status' => $status
        ]
    ]);
} else {
    // User is not logged in
    echo json_encode([
        'success' => true,
        'logged_in' => false
    ]);
}
