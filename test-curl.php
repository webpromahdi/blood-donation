<?php
$ch = curl_init('http://localhost/blood-donation/api/chat/send.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['receiver_id' => 15, 'message' => 'hi']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Cookie: PHPSESSID=q0ohomf938217l8i5jofbcv2c4']);
echo "Output: " . curl_exec($ch);
