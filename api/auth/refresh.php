<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/auth_cookie.php';

/**
 * Refresh Token Endpoint
 * POST /api/auth/refresh.php
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$refreshToken = isset($_COOKIE['refreshToken']) ? $_COOKIE['refreshToken'] : null;

if (!$refreshToken) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Refresh token missing']);
    exit;
}

// Verify the refresh token
$payload = JWT::verifyToken($refreshToken, JWT_REFRESH_SECRET);

if (!$payload) {
    http_response_code(401);
    clearAuthCookie(); // Clear invalid cookies
    echo json_encode(['success' => false, 'message' => 'Invalid or expired refresh token']);
    exit;
}

// Clean up payload (remove old exp)
unset($payload['exp']);

// Issue a new access token
$accessToken = JWT::generateToken($payload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES);

// We keep the old refresh token, or issue a new one? Usually, we just issue a new access token
// But updating the cookie expiration is good.
setAuthCookie($accessToken, $refreshToken);

echo json_encode([
    'success' => true,
    'message' => 'Token refreshed successfully',
    'data' => [
        'accessToken' => $accessToken
    ]
]);
