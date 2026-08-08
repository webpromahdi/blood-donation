<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Hospital Blood Inventory Endpoint
 * GET /api/hospital/inventory.php - Get current inventory levels
 * PUT /api/hospital/inventory.php - Update inventory levels
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

$user = requireAuth(['hospital']);
requireApprovedStatus($_SESSION['user_id'], 'hospital');

$userId = $_SESSION['user_id'];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Get hospital_id
$stmt = $conn->prepare("SELECT id FROM hospitals WHERE user_id = ?");
$stmt->execute([$userId]);
$hospital = $stmt->fetch();

if (!$hospital) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Hospital record not found']);
    exit;
}
$hospitalId = $hospital['id'];


if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $bloodGroupId = isset($data->blood_group_id) ? (int)$data->blood_group_id : 0;
    $units = isset($data->units) ? (int)$data->units : -1;

    if ($bloodGroupId <= 0 || $units < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }

    try {
        // Insert or update on duplicate key
        $stmt = $conn->prepare("INSERT INTO hospital_inventory (hospital_id, blood_group_id, units) 
                                VALUES (?, ?, ?) 
                                ON DUPLICATE KEY UPDATE units = ?");
        $stmt->execute([$hospitalId, $bloodGroupId, $units, $units]);

        echo json_encode(['success' => true, 'message' => 'Inventory updated']);
    } catch (Exception $e) {
        error_log("Inventory Update Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update inventory']);
    }
    exit;
}

// Handle GET
try {
    // Get all blood groups and left join with hospital inventory
    $stmt = $conn->prepare("
        SELECT bg.id as blood_group_id, bg.blood_type as blood_group, COALESCE(hi.units, 0) as units
        FROM blood_groups bg
        LEFT JOIN hospital_inventory hi ON bg.id = hi.blood_group_id AND hi.hospital_id = ?
        ORDER BY bg.id ASC
    ");
    $stmt->execute([$hospitalId]);
    $inventory = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'inventory' => $inventory
    ]);

} catch (Exception $e) {
    error_log("Inventory Fetch Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch inventory']);
}
