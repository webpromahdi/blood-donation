<?php
$conn = new PDO('mysql:host=localhost;dbname=blood_donation', 'root', '');
$stmt = $conn->query("SELECT user_id FROM hospitals LIMIT 1");
$hospital = $stmt->fetch(PDO::FETCH_ASSOC);

$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
session_start();
$_SESSION['user_id'] = $hospital['user_id'];
$_SESSION['role'] = 'hospital';
$_SESSION['status'] = 'approved';
$_SESSION['logged_in'] = true;
$_SESSION['email'] = 'test@test.com';
$_SESSION['name'] = 'test';

// Let's capture the output of requests.php
ob_start();
require 'api/hospital/requests.php';
$output = ob_get_clean();

echo "API Output:\n$output\n";
