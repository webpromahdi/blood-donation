<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Admin Update Request Status Endpoint
 * POST /api/admin/requests/update-status.php
 * Allows admin to approve or reject a blood request.
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
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth(['admin']);

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['request_id']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Request ID and status are required']);
    exit;
}

$requestId = $input['request_id'];
$status = $input['status'];
$rejectionReason = $input['rejection_reason'] ?? null;

if (!in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    $conn->beginTransaction();

    // Check if request exists
    $stmt = $conn->prepare("SELECT id, status, requester_id, requester_type FROM blood_requests WHERE id = ?");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();

    if (!$request) {
        throw new Exception('Blood request not found');
    }

    if ($request['status'] !== 'pending') {
        throw new Exception("Cannot update status. Request is already {$request['status']}");
    }

    // Update status
    $updateSql = "UPDATE blood_requests SET status = ?, admin_id = ?";
    $params = [$status, $_SESSION['user_id']];

    if ($status === 'approved') {
        $updateSql .= ", approved_at = CURRENT_TIMESTAMP";
    } else if ($status === 'rejected') {
        $updateSql .= ", rejected_at = CURRENT_TIMESTAMP, rejection_reason = ?";
        $params[] = $rejectionReason;
    }

    $updateSql .= " WHERE id = ?";
    $params[] = $requestId;

    $stmt = $conn->prepare($updateSql);
    $stmt->execute($params);

    // Add notification to requester
    $title = $status === 'approved' ? 'Request Approved' : 'Request Rejected';
    $message = $status === 'approved' 
        ? "Your blood request has been approved and is now visible to donors." 
        : "Your blood request was rejected. Reason: " . ($rejectionReason ?? 'Not specified');

    $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type, related_type, related_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $request['requester_id'],
        $title,
        $message,
        $status === 'approved' ? 'success' : 'error',
        'blood_request',
        $requestId
    ]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => "Request successfully {$status}"
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    error_log("Error updating request status: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
