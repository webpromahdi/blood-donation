<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * User Logout Endpoint
 * POST /api/auth/logout.php
 */

// CORS headers for frontend



// Start session
session_start();

// Clear all session data
$_SESSION = [];

// Delete the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy the session
session_destroy();

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);

