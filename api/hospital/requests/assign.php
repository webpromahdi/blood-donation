<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Hospital Donor Assignment Endpoint
 * POST /api/hospital/requests/assign.php
 * 
 * Assigns a donor to a blood request by creating a donation record
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

$user = requireAuth(['hospital']);
requireApprovedStatus($_SESSION['user_id'], 'hospital');

$data = json_decode(file_get_contents("php://input"));
$requestId = isset($data->request_id) ? (int)$data->request_id : 0;
$donorId = isset($data->donor_id) ? (int)$data->donor_id : 0;

if ($requestId <= 0 || $donorId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request or donor ID']);
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

    // Verify request belongs to this hospital and is active
    $stmtReq = $conn->prepare("SELECT status FROM blood_requests WHERE id = ? AND requester_id = ? AND requester_type = 'hospital'");
    $stmtReq->execute([$requestId, $_SESSION['user_id']]);
    $req = $stmtReq->fetch();

    if (!$req) {
        throw new Exception("Request not found or unauthorized");
    }

    if (in_array($req['status'], ['completed', 'rejected', 'cancelled'])) {
        throw new Exception("Cannot assign donor to this request because it is " . $req['status']);
    }

    // Verify donor exists and is available
    $stmtDonor = $conn->prepare("SELECT is_available, next_eligible_date FROM donors WHERE id = ?");
    $stmtDonor->execute([$donorId]);
    $donor = $stmtDonor->fetch();

    if (!$donor) {
        throw new Exception("Donor not found");
    }

    if (!$donor['is_available'] || ($donor['next_eligible_date'] && strtotime($donor['next_eligible_date']) > time())) {
        throw new Exception("Donor is currently unavailable or not eligible yet");
    }

    // Check if donation record already exists for this donor & request
    $stmtCheck = $conn->prepare("SELECT id FROM donations WHERE request_id = ? AND donor_id = ? AND status != 'cancelled'");
    $stmtCheck->execute([$requestId, $donorId]);
    if ($stmtCheck->fetch()) {
        throw new Exception("This donor is already assigned to this request");
    }

    // 1. Create donation record
    $stmtDonation = $conn->prepare("INSERT INTO donations (request_id, donor_id, status, accepted_at) VALUES (?, ?, 'accepted', CURRENT_TIMESTAMP)");
    $stmtDonation->execute([$requestId, $donorId]);

    // 2. Update request status to 'in_progress' if it was 'approved' or 'pending'
    if ($req['status'] === 'approved' || $req['status'] === 'pending') {
        $stmtUpdateReq = $conn->prepare("UPDATE blood_requests SET status = 'in_progress' WHERE id = ?");
        $stmtUpdateReq->execute([$requestId]);
    }

    // 3. Mark donor as unavailable temporarily (optional, but good practice if they are now engaged)
    $stmtUpdateDonor = $conn->prepare("UPDATE donors SET is_available = 0 WHERE id = ?");
    $stmtUpdateDonor->execute([$donorId]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Donor successfully assigned to request'
    ]);

} catch (Exception $e) {
    $conn->rollBack();
    error_log("Hospital Assign Donor Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
