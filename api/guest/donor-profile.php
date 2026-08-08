<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Guest Donor Profile Endpoint
 * GET /api/guest/donor-profile.php?id=1
 * 
 * Returns public donor profile and limited history
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

require_once __DIR__ . '/../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid donor ID']);
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
    // Get donor details
    $donorQuery = "
        SELECT 
            d.id as donor_id,
            u.id as user_id, 
            u.name, 
            u.created_at as memberSince,
            bg.blood_type as bloodGroup, 
            d.city as area, 
            d.city as division, 
            d.total_donations as totalDonations, 
            d.is_available as available,
            d.age
        FROM users u 
        JOIN donors d ON u.id = d.user_id 
        JOIN blood_groups bg ON d.blood_group_id = bg.id 
        WHERE d.id = ? AND u.status = 'approved' AND u.role = 'donor'
    ";
    
    $stmt = $conn->prepare($donorQuery);
    $stmt->execute([$id]);
    $donor = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$donor) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Donor not found']);
        exit;
    }

    // Process donor fields
    $donor['available'] = (bool)$donor['available'];
    $donor['totalDonations'] = (int)$donor['totalDonations'];
    $donor['livesSaved'] = $donor['totalDonations'] * 3;
    $donor['age'] = $donor['age'] ? (int)$donor['age'] : 25; // fallback
    
    // Member since year
    $donor['memberSince'] = date('Y', strtotime($donor['memberSince']));

    // Get initials
    $words = explode(' ', $donor['name']);
    $initials = '';
    foreach (array_slice($words, 0, 2) as $w) {
        if (!empty($w)) $initials .= strtoupper(substr($w, 0, 1));
    }
    $donor['initials'] = $initials ?: 'D';

    // Get donation history (last 5)
    $historyQuery = "
        SELECT h.hospital_name as hospital, DATE_FORMAT(d.completed_at, '%d %b %Y') as date
        FROM donations d
        JOIN blood_requests r ON d.request_id = r.id
        LEFT JOIN (
            SELECT u2.id, u2.name as hospital_name 
            FROM users u2 WHERE u2.role = 'hospital'
        ) h ON r.requester_id = h.id
        WHERE d.donor_id = ? AND d.status = 'completed'
        ORDER BY d.completed_at DESC
        LIMIT 5
    ";
    
    $stmtHistory = $conn->prepare($historyQuery);
    $stmtHistory->execute([$id]);
    $history = $stmtHistory->fetchAll(PDO::FETCH_ASSOC);

    // Some manual fallback for empty history if no hospital joined well
    foreach ($history as &$h) {
        if (!$h['hospital']) $h['hospital'] = 'Local Hospital';
    }

    echo json_encode([
        'success' => true,
        'donor' => $donor,
        'history' => $history
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
}
