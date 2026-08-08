<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Public Blogs Endpoint
 * GET /api/guest/blogs.php
 * Returns a list of published blogs
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
    // Get all published blogs
    $stmt = $conn->prepare("
        SELECT b.id, b.title, b.slug, b.excerpt, b.image_url, b.category, b.published_at, u.name as author 
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        WHERE b.status = 'published'
        ORDER BY b.published_at DESC
    ");
    $stmt->execute();
    $blogs = $stmt->fetchAll();

    $formattedBlogs = array_map(function($b) {
        return [
            'id' => $b['id'],
            'title' => $b['title'],
            'slug' => $b['slug'],
            'excerpt' => $b['excerpt'],
            'image' => $b['image_url'],
            'tag' => $b['category'],
            'date' => date('Y-m-d', strtotime($b['published_at'])),
            'author' => $b['author'],
            'readTime' => '5 min' // Mock read time for now
        ];
    }, $blogs);

    echo json_encode([
        'success' => true,
        'blogs' => $formattedBlogs
    ]);
} catch (Exception $e) {
    error_log("Blogs fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch blogs']);
}
