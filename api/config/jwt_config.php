<?php
/**
 * JWT Configuration
 */

require_once __DIR__ . '/../utils/env_loader.php';
// Load the .env file
loadEnv(__DIR__ . '/../.env');

// Read from $_ENV or use fallback (fallback is just for extreme cases, you should define them in .env)
define('JWT_ACCESS_SECRET', $_ENV['JWT_ACCESS_SECRET'] ?? 'fallback_access_key');
define('JWT_REFRESH_SECRET', $_ENV['JWT_REFRESH_SECRET'] ?? 'fallback_refresh_key');

define('JWT_ACCESS_EXPIRES', 15 * 60); // 15 minutes in seconds
define('JWT_REFRESH_EXPIRES', 7 * 24 * 60 * 60); // 7 days in seconds
