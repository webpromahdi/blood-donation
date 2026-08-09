<?php
$conn = new PDO('mysql:host=localhost;dbname=blood_donation', 'root', '');
$stmt = $conn->query("SELECT id, role, name FROM users WHERE role = 'hospital' LIMIT 1");
$hospital = $stmt->fetch(PDO::FETCH_ASSOC);

$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
$_GET['role'] = 'admin';
$_GET['limit'] = '1';

session_start();
$_SESSION['user_id'] = $hospital['id'];
$_SESSION['role'] = $hospital['role'];
$_SESSION['status'] = 'approved';
$_SESSION['logged_in'] = true;
$_SESSION['email'] = 'test@test.com';
$_SESSION['name'] = $hospital['name'];

ob_start();
require 'api/chat/search-users.php';
$output = ob_get_clean();

echo "API Output:\n$output\n";
