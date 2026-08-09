<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
session_start();
$_SESSION['user_id'] = 4; // Hospital user
$_SESSION['role'] = 'hospital';
$_SESSION['status'] = 'approved';
$_SESSION['logged_in'] = true;

ob_start();
require 'api/chat/conversations.php';
$output = ob_get_clean();

echo "Output:\n$output\n";
