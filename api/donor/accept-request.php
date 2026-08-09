<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Donor Accept Request Endpoint
 * POST /api/donor/accept-request.php
 */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAuth(['donor']);

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['request_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Request ID is required']);
    exit;
}

$requestId = $input['request_id'];
$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    $conn->beginTransaction();

    // Get donor id
    $stmt = $conn->prepare("SELECT id FROM donors WHERE user_id = ?");
    $stmt->execute([$userId]);
    $donor = $stmt->fetch();

    if (!$donor) {
        throw new Exception('Donor profile not found');
    }
    
    $donorId = $donor['id'];

    // Check if request is still available (status = approved, and no active donation)
    $stmt = $conn->prepare("SELECT id, status, requester_id FROM blood_requests WHERE id = ? FOR UPDATE");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();

    if (!$request) {
        throw new Exception('Request not found');
    }

    if ($request['status'] !== 'approved') {
        throw new Exception("This request is no longer available.");
    }

    // Check if it's already claimed
    $stmt = $conn->prepare("SELECT id FROM donations WHERE request_id = ? AND status != 'cancelled'");
    $stmt->execute([$requestId]);
    if ($stmt->fetch()) {
        throw new Exception('This request has already been accepted by another donor.');
    }

    // Create donation record
    $stmt = $conn->prepare("INSERT INTO donations (request_id, donor_id, status) VALUES (?, ?, 'in_progress')");
    $stmt->execute([$requestId, $donorId]);
    $donationId = $conn->lastInsertId();

    // Update request status
    $stmt = $conn->prepare("UPDATE blood_requests SET status = 'in_progress' WHERE id = ?");
    $stmt->execute([$requestId]);

    // Notify the seeker
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type, related_type, related_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $request['requester_id'],
        'Donor Assigned',
        'A donor has accepted your blood request. Please check the request details to chat with them.',
        'info',
        'blood_request',
        $requestId
    ]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Request accepted successfully!',
        'donation_id' => $donationId
    ]);

} catch (Exception $e) {
    $conn->rollBack();
    error_log("Error accepting request: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
