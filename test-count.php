<?php
$conn = new PDO('mysql:host=localhost;dbname=blood_donation', 'root', '');
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';

session_start();
$_SESSION['user_id'] = 2; // Admin ID
$_SESSION['role'] = 'admin';
$_SESSION['status'] = 'approved';
$_SESSION['logged_in'] = true;

ob_start();
require 'api/notifications/list.php';
$output = ob_get_clean();
echo $output;
