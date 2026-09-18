<?php

declare(strict_types=1);

require __DIR__ . '/vendor/PHPMailer/PHPMailer/src/Exception.php';
require __DIR__ . '/vendor/PHPMailer/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/vendor/PHPMailer/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const LIMITS = [
    'firstName' => 80,
    'lastName' => 80,
    'email' => 254,
    'phone' => 40,
    'comments' => 2000,
    'hearAbout' => 80,
    'contactPreference' => 20,
];

const HEAR_ABOUT_OPTIONS = [
    'Direct Mail Invitation',
    'Internet',
    'Print Ad',
    'Family/Friend Referral',
    'new32 Team',
    'Email',
];

const CONTACT_PREFERENCES = ['Email', 'Phone'];

function json_response(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return is_string($ip) && $ip !== '' ? $ip : '0.0.0.0';
}

function apply_cors(array $config): void
{
    $raw = trim((string) ($config['ALLOWED_ORIGINS'] ?? ''));
    if ($raw === '') {
        return;
    }

    $allowed = array_values(array_filter(array_map('trim', explode(',', $raw))));
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
}

function check_rate_limit(string $storageDir, string $ip, int $max, int $windowSeconds): bool
{
    if (!is_dir($storageDir) && !mkdir($storageDir, 0750, true) && !is_dir($storageDir)) {
        return true;
    }

    $file = $storageDir . '/rate-limit.json';
    $now = time();
    $data = [];

    $fp = fopen($file, 'c+');
    if ($fp === false) {
        return true;
    }

    try {
        if (!flock($fp, LOCK_EX)) {
            return true;
        }

        $raw = stream_get_contents($fp);
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }

        $bucket = [];
        if (isset($data[$ip]) && is_array($data[$ip])) {
            foreach ($data[$ip] as $ts) {
                if (is_int($ts) && $ts > $now - $windowSeconds) {
                    $bucket[] = $ts;
                }
            }
        }

        if (count($bucket) >= $max) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }

        $bucket[] = $now;
        $data[$ip] = $bucket;

        foreach ($data as $key => $timestamps) {
            if (!is_array($timestamps)) {
                unset($data[$key]);
                continue;
            }
            $fresh = [];
            foreach ($timestamps as $ts) {
                if (is_int($ts) && $ts > $now - $windowSeconds) {
                    $fresh[] = $ts;
                }
            }
            if ($fresh === []) {
                unset($data[$key]);
            } else {
                $data[$key] = $fresh;
            }
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    } catch (Throwable $e) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
}

$configPath = __DIR__ . '/config.php';
if (!is_readable($configPath)) {
    json_response(503, [
        'ok' => false,
        'error' => 'Contact form is not configured yet.',
    ]);
}

/** @var array $config */
$config = require $configPath;
apply_cors($config);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    json_response(400, ['ok' => false, 'error' => 'Empty request body.']);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    json_response(400, ['ok' => false, 'error' => 'Invalid JSON body.']);
}

$honeypot = trim((string) ($payload['website'] ?? ''));
if ($honeypot !== '') {
    json_response(200, ['ok' => true]);
}

$firstName = trim((string) ($payload['firstName'] ?? ''));
$lastName = trim((string) ($payload['lastName'] ?? ''));
$email = trim((string) ($payload['email'] ?? ''));
$phone = trim((string) ($payload['phone'] ?? ''));
$contactPreference = trim((string) ($payload['contactPreference'] ?? ''));
$comments = trim((string) ($payload['comments'] ?? ''));
$hearAbout = trim((string) ($payload['hearAbout'] ?? ''));

$errors = [];

if ($firstName === '' || str_len($firstName) > LIMITS['firstName']) {
    $errors[] = 'Valid first name is required.';
}
if ($lastName === '' || str_len($lastName) > LIMITS['lastName']) {
    $errors[] = 'Valid last name is required.';
}
if ($email === '' || str_len($email) > LIMITS['email'] || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required.';
}
if ($phone === '' || str_len($phone) > LIMITS['phone']) {
    $errors[] = 'Valid phone is required.';
}
if (!in_array($contactPreference, CONTACT_PREFERENCES, true)) {
    $errors[] = 'Please choose Email or Phone as contact preference.';
}
if (str_len($comments) > LIMITS['comments']) {
    $errors[] = 'Comments are too long.';
}
if ($hearAbout !== '' && !in_array($hearAbout, HEAR_ABOUT_OPTIONS, true)) {
    $errors[] = 'Invalid how-did-you-hear selection.';
}

if ($errors !== []) {
    json_response(422, [
        'ok' => false,
        'error' => $errors[0],
    ]);
}

$max = (int) ($config['RATE_LIMIT_MAX'] ?? 5);
$window = (int) ($config['RATE_LIMIT_WINDOW_SECONDS'] ?? 3600);
$storageDir = __DIR__ . '/storage';

if (!check_rate_limit($storageDir, client_ip(), max(1, $max), max(60, $window))) {
    json_response(429, [
        'ok' => false,
        'error' => 'Please wait a bit before sending another message.',
    ]);
}

$requiredKeys = [
    'FROM',
    'TO',
    'SMTP_PASSWORD',
];
foreach ($requiredKeys as $key) {
    if (empty($config[$key]) || !is_string($config[$key])) {
        json_response(503, [
            'ok' => false,
            'error' => 'Contact form is not fully configured.',
        ]);
    }
}

$from = (string) $config['FROM'];
$fromName = (string) ($config['FROM_NAME'] ?? 'New32 Website');
$to = (string) $config['TO'];
$smtpUser = trim((string) ($config['SMTP_USER'] ?? ''));
if ($smtpUser === '') {
    $smtpUser = $from;
}
$smtpPassword = (string) $config['SMTP_PASSWORD'];
$bccRaw = trim((string) ($config['BCC'] ?? ''));
$bccList = $bccRaw === ''
    ? []
    : array_values(array_filter(array_map('trim', explode(',', $bccRaw))));

$fullName = $firstName . ' ' . $lastName;
$subject = 'Website contact from ' . $fullName;

$lines = [
    'New contact form submission from the new32 website',
    '',
    'Name: ' . $fullName,
    'Email: ' . $email,
    'Phone: ' . $phone,
    'Preferred contact: ' . $contactPreference,
    'How they heard about us: ' . ($hearAbout !== '' ? $hearAbout : '(not provided)'),
    '',
    'Questions / Comments:',
    $comments !== '' ? $comments : '(none)',
    '',
    '—',
    'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    'IP: ' . client_ip(),
];
$body = implode("\n", $lines);

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->Port = 587;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPassword;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($from, $fromName);
    $mail->addAddress($to);
    foreach ($bccList as $bcc) {
        $mail->addBCC($bcc);
    }
    $mail->addReplyTo($email, $fullName);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->AltBody = $body;

    $mail->send();

    json_response(200, ['ok' => true]);
} catch (MailException $e) {
    error_log('Contact form mail error: ' . $e->getMessage());
    json_response(500, [
        'ok' => false,
        'error' => 'Unable to send your message right now. Please try again or call the office.',
    ]);
} catch (Throwable $e) {
    error_log('Contact form error: ' . $e->getMessage());
    json_response(500, [
        'ok' => false,
        'error' => 'Unable to send your message right now. Please try again or call the office.',
    ]);
}
