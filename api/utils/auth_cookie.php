<?php
require_once __DIR__ . '/../config/jwt_config.php';

/**
 * Set Auth Cookies
 * Matches the Node.js implementation: HttpOnly, Secure, SameSite
 */
function setAuthCookie($accessToken, $refreshToken = null) {
    // Is it HTTPS?
    $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
    
    // Cookie options
    $cookieOptions = [
        'expires' => time() + JWT_ACCESS_EXPIRES,
        'path' => '/',
        'domain' => '', // Current domain
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => $isSecure ? 'None' : 'Lax'
    ];

    if ($accessToken) {
        setcookie('accessToken', $accessToken, $cookieOptions);
    }

    if ($refreshToken) {
        $refreshOptions = $cookieOptions;
        $refreshOptions['expires'] = time() + JWT_REFRESH_EXPIRES;
        setcookie('refreshToken', $refreshToken, $refreshOptions);
    }
}

/**
 * Clear Auth Cookies
 */
function clearAuthCookie() {
    $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
    
    $cookieOptions = [
        'expires' => time() - 3600, // Past time to delete
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => $isSecure ? 'None' : 'Lax'
    ];

    setcookie('accessToken', '', $cookieOptions);
    setcookie('refreshToken', '', $cookieOptions);
}
