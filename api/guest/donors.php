<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Guest Donors List Endpoint
 * GET /api/guest/donors.php
 * Query params: ?page=1&query=&group=A%2B&division=Dhaka&available=1
 * 
 * Returns paginated public donor list
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

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$perPage = 6;
$offset = ($page - 1) * $perPage;

$searchQuery = isset($_GET['query']) ? trim($_GET['query']) : '';
$group = isset($_GET['group']) ? trim($_GET['group']) : '';
$division = isset($_GET['division']) ? trim($_GET['division']) : '';
$onlyAvailable = isset($_GET['available']) && $_GET['available'] === '1';

try {
    $whereConditions = ["u.status = 'approved'", "u.role = 'donor'"];
    $params = [];

    if (!empty($searchQuery)) {
        $whereConditions[] = "u.name LIKE ?";
        $params[] = "%$searchQuery%";
    }

    if (!empty($group)) {
        $whereConditions[] = "bg.blood_type = ?";
        $params[] = $group;
    }

    if (!empty($division)) {
        // Simple mock since we only have city in DB
        $whereConditions[] = "d.city LIKE ?";
        $params[] = "%$division%";
    }

    if ($onlyAvailable) {
        $whereConditions[] = "d.is_available = 1";
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Count total rows for pagination
    $countQuery = "
        SELECT COUNT(*) as total 
        FROM users u 
        JOIN donors d ON u.id = d.user_id 
        JOIN blood_groups bg ON d.blood_group_id = bg.id 
        WHERE $whereClause
    ";
    
    $stmtCount = $conn->prepare($countQuery);
    $stmtCount->execute($params);
    $totalRows = $stmtCount->fetch()['total'];
    
    // Fetch paginated data
    $dataQuery = "
        SELECT 
            u.id, 
            u.name, 
            bg.blood_type as bloodGroup, 
            d.city as area, 
            d.city as division, 
            d.total_donations as totalDonations, 
            d.is_available as available, 
            d.last_donation_date as lastDonation
        FROM users u 
        JOIN donors d ON u.id = d.user_id 
        JOIN blood_groups bg ON d.blood_group_id = bg.id 
        WHERE $whereClause
        ORDER BY d.is_available DESC, d.total_donations DESC, u.created_at DESC
        LIMIT $perPage OFFSET $offset
    ";
    
    $stmtData = $conn->prepare($dataQuery);
    $stmtData->execute($params);
    $donors = $stmtData->fetchAll(PDO::FETCH_ASSOC);

    // Cast available to boolean for JS
    foreach ($donors as &$donor) {
        $donor['available'] = (bool)$donor['available'];
        $donor['totalDonations'] = (int)$donor['totalDonations'];
    }

    echo json_encode([
        'success' => true,
        'donors' => $donors,
        'total' => $totalRows,
        'totalPages' => ceil($totalRows / $perPage),
        'currentPage' => $page
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
}
