<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * User Logout Endpoint
 * POST /api/auth/logout.php
 */

// CORS headers for frontend



require_once __DIR__ . '/../utils/auth_cookie.php';

// Clear all auth cookies
clearAuthCookie();

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);

