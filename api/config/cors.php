<?php
/**
 * CORS Configuration
 * Include this at the TOP of every API file.
 * Usage: require_once __DIR__ . '/cors.php';   (from api/config/)
 *        require_once __DIR__ . '/../config/cors.php';  (from api/auth/, api/donor/ etc.)
 *        require_once __DIR__ . '/../../config/cors.php'; (from api/donor/health/ etc.)
 */

$allowed_origins = [
    'http://localhost:5173',   // React dev server
    'http://localhost:3000',   // alternate dev port
    'http://127.0.0.1:5173',
    'https://bloodconnect.vercel.app', // production React URL
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");  // Required for session cookies
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
