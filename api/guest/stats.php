<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Guest Public Stats Endpoint
 * GET /api/guest/stats.php
 * 
 * Returns overall platform statistics and blood availability for the Home page
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

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Basic counts
    $stmt = $conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'donor' AND status = 'approved'");
    $totalDonors = (int)$stmt->fetch()['total'];

    $stmt = $conn->query("SELECT COUNT(*) as total FROM hospitals JOIN users u ON hospitals.user_id = u.id WHERE u.status = 'approved'");
    $totalHospitals = (int)$stmt->fetch()['total'];

    // Lives saved based on completed donations (approx 3 lives per donation)
    $stmt = $conn->query("SELECT COUNT(*) as total FROM donations WHERE status = 'completed'");
    $totalDonations = (int)$stmt->fetch()['total'];
    $livesSaved = $totalDonations * 3;

    // Blood group availability (Count active donors per blood group)
    $bgQuery = "
        SELECT bg.blood_type, COUNT(d.id) as count
        FROM blood_groups bg
        LEFT JOIN donors d ON bg.id = d.blood_group_id AND d.is_available = 1
        LEFT JOIN users u ON d.user_id = u.id AND u.status = 'approved'
        GROUP BY bg.id
    ";
    
    $bgStmt = $conn->query($bgQuery);
    $bgData = $bgStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $availability = [];
    foreach ($bgData as $row) {
        $availability[$row['blood_type']] = (int)$row['count'];
    }

    echo json_encode([
        'success' => true,
        'impact' => [
            'donors' => $totalDonors,
            'livesSaved' => $livesSaved,
            'hospitals' => $totalHospitals
        ],
        'availability' => $availability
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
}
