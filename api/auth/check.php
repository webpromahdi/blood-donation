<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Session Check Endpoint
 * GET /api/auth/check.php
 * 
 * Check if user is currently logged in and return user info
 */

// CORS headers for frontend



// Start session
session_start();

// Session timeout (1 hour)
$session_timeout = 3600;

// Check if user is logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {

    // Check for session timeout
    if (isset($_SESSION['login_time'])) {
        $elapsed = time() - $_SESSION['login_time'];

        if ($elapsed > $session_timeout) {
            // Session expired
            session_destroy();
            echo json_encode([
                'success' => true,
                'logged_in' => false,
                'message' => 'Session expired'
            ]);
            exit;
        }
    }

    // Get user status from database for donors and hospitals
    $status = null;
    if (in_array($_SESSION['role'], ['donor', 'hospital'])) {
        require_once __DIR__ . '/../config/database.php';
        
        $database = new Database();
        $conn = $database->getConnection();
        
        if ($conn) {
            try {
                $stmt = $conn->prepare("SELECT status FROM users WHERE id = ?");
                $stmt->execute([$_SESSION['user_id']]);
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
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'role' => $_SESSION['role'],
            'name' => $_SESSION['name'],
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
