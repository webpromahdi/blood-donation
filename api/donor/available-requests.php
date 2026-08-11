<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Donor Available Requests Endpoint
 * GET /api/donor/available-requests.php
 * Fetches approved public blood requests matching the donor's blood type.
 */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAuth(['donor']);
requireApprovedStatus($_SESSION['user_id'], 'donor');

$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Get donor's blood group id
    $stmt = $conn->prepare("SELECT blood_group_id FROM donors WHERE user_id = ?");
    $stmt->execute([$userId]);
    $donor = $stmt->fetch();

    if (!$donor) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Donor profile not found']);
        exit;
    }

    $bloodGroupId = $donor['blood_group_id'];

    // Fetch approved requests that match the donor's blood group
    // Also ensure the request isn't already fully claimed or in progress
    $sql = "SELECT r.*, bg.blood_type 
            FROM blood_requests r
            JOIN blood_groups bg ON r.blood_group_id = bg.id
            WHERE r.status = 'approved' 
              AND r.blood_group_id = ?
              AND r.id NOT IN (
                  SELECT request_id FROM donations WHERE status != 'cancelled'
              )
            ORDER BY r.urgency DESC, r.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$bloodGroupId]);
    $requests = $stmt->fetchAll();

    $formattedRequests = array_map(function($req) {
        return [
            'id' => $req['id'],
            'request_code' => $req['request_code'],
            'patient_name' => $req['patient_name'],
            'blood_type' => $req['blood_type'],
            'quantity' => $req['quantity'],
            'hospital_name' => $req['hospital_name'],
            'city' => $req['city'],
            'urgency' => $req['urgency'],
            'created_at' => $req['created_at']
        ];
    }, $requests);

    echo json_encode([
        'success' => true,
        'requests' => $formattedRequests
    ]);
} catch (Exception $e) {
    error_log("Error fetching available requests for donor: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch available requests']);
}
