<?php
/**
 * JWT Utility Class (Raw PHP Implementation)
 * Zero dependency implementation for HMAC-SHA256 JWT
 */

class JWT {
    /**
     * Base64Url encode string
     */
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Base64Url decode string
     */
    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    /**
     * Generate JWT Token
     * 
     * @param array $payload The payload data
     * @param string $secret The secret key
     * @param int $expiresIn Expiration time in seconds
     * @return string JWT Token
     */
    public static function generateToken($payload, $secret, $expiresIn = null) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        // Add expiration claim if provided
        if ($expiresIn !== null) {
            $payload['exp'] = time() + $expiresIn;
        }
        
        $payloadJson = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payloadJson);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verify and decode JWT Token
     * 
     * @param string $jwt The JWT token
     * @param string $secret The secret key
     * @return array|false Payload array if valid, false if invalid or expired
     */
    public static function verifyToken($jwt, $secret) {
        if (empty($jwt)) return false;
        
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) return false;

        $header = json_decode(self::base64UrlDecode($tokenParts[0]), true);
        $payload = json_decode(self::base64UrlDecode($tokenParts[1]), true);
        $signature_provided = $tokenParts[2];

        // Ensure it's HS256
        if (!isset($header['alg']) || $header['alg'] !== 'HS256') {
            return false;
        }

        $base64UrlHeader = $tokenParts[0];
        $base64UrlPayload = $tokenParts[1];
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        // Verify signature (use hash_equals to prevent timing attacks)
        if (hash_equals($base64UrlSignature, $signature_provided)) {
            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false; // Token expired
            }
            return $payload;
        }
        
        return false;
    }
}
