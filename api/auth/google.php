<?php
require_once __DIR__ . '/../config/cors.php';

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
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/auth_cookie.php';

$data = json_decode(file_get_contents('php://input'), true);
$credential = $data['credential'] ?? null;

if (!$credential) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Google credential is required']);
    exit;
}

// Verify token using Google's tokeninfo endpoint
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
$response = @file_get_contents($verifyUrl);

if ($response === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired Google token']);
    exit;
}

$googleUser = json_decode($response, true);

if (!isset($googleUser['email']) || !isset($googleUser['sub'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid Google token payload']);
    exit;
}

$email = $googleUser['email'];
$googleId = $googleUser['sub'];
$name = $googleUser['name'] ?? 'Google User';

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Check if user exists by email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // User exists, but might have registered with credentials
        if ($user['status'] === 'blocked') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Account is blocked']);
            exit;
        }

        // Check if account has been rejected or is pending (for donor/hospital accounts)
        if (in_array($user['role'], ['donor', 'hospital'])) {
            if ($user['status'] === 'rejected') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Your account has been rejected by the admin.',
                    'rejected' => true
                ]);
                exit;
            }
            
            if ($user['status'] === 'pending') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Your account is under review. Please wait for admin approval.',
                    'requires_approval' => true
                ]);
                exit;
            }
        }

        // Link Google ID if missing
        if (!$user['google_id']) {
            $updateStmt = $conn->prepare("UPDATE users SET google_id = ?, auth_provider = 'google', email_verified_at = CURRENT_TIMESTAMP WHERE id = ?");
            $updateStmt->execute([$googleId, $user['id']]);
        }

        // Generate JWT Payload
        $payload = [
            'userId' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ];

        $accessToken = JWT::generateToken($payload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES);
        $refreshToken = JWT::generateToken($payload, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES);

        // Set HttpOnly Cookies
        setAuthCookie($accessToken, $refreshToken);

        echo json_encode([
            'success' => true,
            'message' => 'Logged in successfully',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'status' => $user['status']
            ],
            'tokens' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken
            ]
        ]);
    } else {
        // User does not exist, requires registration
        echo json_encode([
            'success' => false,
            'requires_registration' => true,
            'google_data' => [
                'email' => $email,
                'name' => $name,
                'google_id' => $googleId,
                'token' => $credential
            ],
            'message' => 'Account not found. Please complete registration.'
        ]);
    }

} catch (PDOException $e) {
    error_log("Google Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Login failed due to a server error']);
}
