<?php

/**
 * Unused leftover from an OAuth prototype. Contact mail uses SMTP App Password instead.
 * Minimal OAuth2 token provider for Gmail SMTP (XOAUTH2).
 * Refreshes access tokens via Google's token endpoint — no League OAuth package required.
 */

namespace New32\Contact;

use PHPMailer\PHPMailer\OAuthTokenProvider;

final class GoogleOAuthTokenProvider implements OAuthTokenProvider
{
    private string $userEmail;
    private string $clientId;
    private string $clientSecret;
    private string $refreshToken;

    private ?string $accessToken = null;
    private int $expiresAt = 0;

    public function __construct(
        string $userEmail,
        string $clientId,
        string $clientSecret,
        string $refreshToken
    ) {
        $this->userEmail = $userEmail;
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
        $this->refreshToken = $refreshToken;
    }

    public function getOauth64(): string
    {
        $token = $this->getAccessToken();
        return base64_encode(
            "user={$this->userEmail}\001auth=Bearer {$token}\001\001"
        );
    }

    private function getAccessToken(): string
    {
        if ($this->accessToken !== null && time() < $this->expiresAt - 60) {
            return $this->accessToken;
        }

        $ch = curl_init('https://oauth2.googleapis.com/token');
        if ($ch === false) {
            throw new \RuntimeException('Unable to initialize cURL for token refresh.');
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_POSTFIELDS => http_build_query([
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $this->refreshToken,
                'grant_type' => 'refresh_token',
            ]),
        ]);

        $raw = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new \RuntimeException('Token refresh failed: ' . $curlError);
        }

        $data = json_decode($raw, true);
        if ($httpCode !== 200 || !is_array($data) || empty($data['access_token'])) {
            $detail = is_array($data) && isset($data['error'])
                ? (string) $data['error']
                : "HTTP {$httpCode}";
            throw new \RuntimeException('Token refresh rejected: ' . $detail);
        }

        $this->accessToken = (string) $data['access_token'];
        $expiresIn = isset($data['expires_in']) ? (int) $data['expires_in'] : 3600;
        $this->expiresAt = time() + max(60, $expiresIn);

        return $this->accessToken;
    }
}
