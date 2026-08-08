<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Public Single Blog Endpoint
 * GET /api/guest/blog.php?slug=xxx
 * Returns a single published blog by slug
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

$slug = $_GET['slug'] ?? '';
if (empty($slug)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Blog slug is required']);
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
    $stmt = $conn->prepare("
        SELECT b.id, b.title, b.slug, b.excerpt, b.content, b.image_url, b.category, b.published_at, u.name as author 
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        WHERE b.status = 'published' AND b.slug = ?
        LIMIT 1
    ");
    $stmt->execute([$slug]);
    $blog = $stmt->fetch();

    if (!$blog) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Blog not found']);
        exit;
    }

    $formattedBlog = [
        'id' => $blog['id'],
        'title' => $blog['title'],
        'slug' => $blog['slug'],
        'excerpt' => $blog['excerpt'],
        'content' => $blog['content'],
        'image' => $blog['image_url'],
        'tag' => $blog['category'],
        'date' => date('M d, Y', strtotime($blog['published_at'])),
        'author' => $blog['author'],
        'readTime' => '5 min'
    ];

    echo json_encode([
        'success' => true,
        'blog' => $formattedBlog
    ]);
} catch (Exception $e) {
    error_log("Blog fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch blog']);
}
