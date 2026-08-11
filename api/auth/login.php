<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * User Login Endpoint
 * POST /api/auth/login.php
 */

// CORS headers for frontend



// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database and utils
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/auth_cookie.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$password = $input['password'];
$selectedRole = isset($input['role']) ? $input['role'] : null;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Connect to database
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Fetch user by email (include status field)
    $stmt = $conn->prepare('SELECT id, name, email, password, role, status FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Check if user exists
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Verify password using bcrypt
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
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

    // Optional: Check if selected role matches user's role
    if ($selectedRole && $user['role'] !== $selectedRole) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Your account is registered as ' . ucfirst($user['role']) . ', not ' . ucfirst($selectedRole)
        ]);
        exit;
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

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ],
        'tokens' => [
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Login failed. Please try again.']);
}

