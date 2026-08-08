<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Public Contact Form Endpoint
 * POST /api/guest/contact.php
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

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents("php://input"));
$name = trim($data->name ?? '');
$email = trim($data->email ?? '');
$subject = trim($data->subject ?? '');
$message = trim($data->message ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
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
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message]);

    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message. We will get back to you soon.'
    ]);
} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to submit message']);
}
