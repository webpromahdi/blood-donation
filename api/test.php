<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
session_start();
$_SESSION['logged_in'] = true;
$_SESSION['user_id'] = 3; 
$_SESSION['email'] = 'donor@demo.com'; 
$_SESSION['name'] = 'Demo Donor'; 
$_SESSION['role'] = 'donor';
require_once 'donor/profile.php';
