<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Seeker Profile & Stats Endpoint
 * GET /api/seeker/profile.php
 * 
 * Normalized Schema: JOINs users + seekers tables
 */


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = requireAuth(['seeker']);

$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $city = $data['city'] ?? '';
    
    if (empty($name)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Name is required']);
        exit;
    }
    
    try {
        $conn->beginTransaction();
        
        $stmtUser = $conn->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?");
        $stmtUser->execute([$name, $phone, $userId]);
        
        $stmtSeeker = $conn->prepare("UPDATE seekers SET address = ?, city = ? WHERE user_id = ?");
        $stmtSeeker->execute([$address, $city, $userId]);
        
        $conn->commit();
        
        // Update session info
        $_SESSION['name'] = $name;
        $_SESSION['phone'] = $phone;
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } catch (PDOException $e) {
        $conn->rollBack();
        error_log("Update seeker profile error: " . $e->getMessage());
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
    exit;
}

try {
    // Get seeker profile including status - JOIN users and seekers tables
    $stmt = $conn->prepare("
        SELECT u.id as user_id, u.name, u.email, u.phone, u.status, u.created_at,
               s.id as seeker_id, s.address, s.city, 
               s.total_requests
        FROM users u
        JOIN seekers s ON u.id = s.user_id
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $seeker = $stmt->fetch();

    if (!$seeker) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Seeker record not found']);
        exit;
    }

    $seekerId = $seeker['seeker_id'];
    
    // Get account status - return early if pending
    $accountStatus = $seeker['status'] ?? 'pending';
    
    echo json_encode([
        'success' => true,
        'profile' => [
            'id' => $seekerId,
            'user_id' => $seeker['user_id'],
            'name' => $seeker['name'],
            'email' => $seeker['email'],
            'phone' => $seeker['phone'],
            'status' => $accountStatus,
            'created_at' => $seeker['created_at'],
            'address' => $seeker['address'],
            'city' => $seeker['city'],
            'total_requests' => (int) $seeker['total_requests']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Seeker Profile Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch profile']);
}

