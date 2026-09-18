#!/usr/bin/env php
<?php

/**
 * Unused leftover from an OAuth prototype. Contact mail uses a Google App Password instead.
 * One-time local helper: exchange a Google OAuth authorization code for a refresh token.
 *
 * Prerequisites:
 * 1. Google Cloud project with Gmail API enabled
 * 2. OAuth consent screen set to Internal (agency Workspace)
 * 3. OAuth Client ID of type "Desktop app"
 *
 * Usage:
 *   php scripts/get-gmail-refresh-token.php \
 *     --client-id=xxx.apps.googleusercontent.com \
 *     --client-secret=xxx
 *
 * Then open the printed URL while logged into the agency Workspace sender address,
 * approve access, copy the `code` query param from the redirect URL, and paste it here.
 *
 * Never deploy this script to DreamHost. Never commit the refresh token.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}

$clientId = '';
$clientSecret = '';

foreach (array_slice($argv, 1) as $arg) {
    if (str_starts_with($arg, '--client-id=')) {
        $clientId = substr($arg, strlen('--client-id='));
    } elseif (str_starts_with($arg, '--client-secret=')) {
        $clientSecret = substr($arg, strlen('--client-secret='));
    } elseif ($arg === '--help' || $arg === '-h') {
        echo "Usage: php scripts/get-gmail-refresh-token.php --client-id=ID --client-secret=SECRET\n";
        exit(0);
    }
}

if ($clientId === '' || $clientSecret === '') {
    fwrite(STDERR, "Both --client-id and --client-secret are required.\n");
    exit(1);
}

// Desktop / installed-app loopback redirect. After approval the browser lands on
// a localhost URL that will fail to connect — copy `code` from the address bar.
$redirectUri = 'http://localhost';
$scope = 'https://mail.google.com/';

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => $scope,
    'access_type' => 'offline',
    'prompt' => 'consent',
]);

echo "\n1. Open this URL in a browser while logged into the agency Workspace sender account:\n\n";
echo $authUrl . "\n\n";
echo "2. Approve access. The browser will try to open http://localhost/?code=...\n";
echo "   Copy the value of the `code` parameter (everything after code= and before & if present).\n\n";
echo 'Paste authorization code here: ';

$code = trim((string) fgets(STDIN));
if ($code === '') {
    fwrite(STDERR, "No code provided.\n");
    exit(1);
}

// If the user pasted a full URL, extract code=
if (str_contains($code, 'code=')) {
    $parts = parse_url($code);
    if (isset($parts['query'])) {
        parse_str($parts['query'], $query);
        if (!empty($query['code'])) {
            $code = (string) $query['code'];
        }
    }
}

$ch = curl_init('https://oauth2.googleapis.com/token');
if ($ch === false) {
    fwrite(STDERR, "Unable to initialize cURL.\n");
    exit(1);
}

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query([
        'code' => $code,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ]),
]);

$raw = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    fwrite(STDERR, "Token exchange failed: {$curlError}\n");
    exit(1);
}

$data = json_decode($raw, true);
if ($httpCode !== 200 || !is_array($data)) {
    fwrite(STDERR, "Token exchange rejected (HTTP {$httpCode}):\n{$raw}\n");
    exit(1);
}

if (empty($data['refresh_token'])) {
    fwrite(STDERR, "No refresh_token in response. Re-run with prompt=consent and ensure you clicked Allow.\n");
    fwrite(STDERR, $raw . "\n");
    exit(1);
}

echo "\nSuccess. Put these values in public/api/config.php on DreamHost:\n\n";
echo "GMAIL_CLIENT_ID     = {$clientId}\n";
echo "GMAIL_CLIENT_SECRET = {$clientSecret}\n";
echo "GMAIL_REFRESH_TOKEN = {$data['refresh_token']}\n";
if (!empty($data['access_token'])) {
    echo "\n(Access token received; you can ignore it — PHPMailer will refresh automatically.)\n";
}
echo "\n";
