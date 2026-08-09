<?php
$conn = new PDO('mysql:host=localhost;dbname=blood_donation', 'root', '');
$stmt = $conn->query('SELECT * FROM blood_requests LIMIT 1');
print_r($stmt->fetch(PDO::FETCH_ASSOC));
