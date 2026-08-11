<?php
/**
 * Simple .env loader for Raw PHP
 */
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return; // No .env file found
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments
        if (strpos($line, '#') === 0) continue;
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, "\"'");
            
            $_ENV[$name] = $value;
            // Also put it in $_SERVER so it behaves like real getenv()
            $_SERVER[$name] = $value;
        }
    }
}
