<?php
$conn = new PDO('mysql:host=localhost;dbname=blood_donation', 'root', '');
$stmt = $conn->query("SELECT id, role, name FROM users WHERE role = 'hospital' LIMIT 1");
$hospital = $stmt->fetch(PDO::FETCH_ASSOC);

$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
session_start();
$_SESSION['user_id'] = $hospital['id'];
$_SESSION['role'] = $hospital['role'];
$_SESSION['status'] = 'approved';
$_SESSION['logged_in'] = true;
$_SESSION['email'] = 'test@test.com';
$_SESSION['name'] = $hospital['name'];

// Fake input stream
$input = json_encode(['receiver_id' => 15, 'message' => 'hi from hospital']);
$stream = fopen('php://memory', 'r+');
fwrite($stream, $input);
rewind($stream);
// We can't actually override php://input this way.
// So let's write a file and modify send.php to read from it OR just run curl.

