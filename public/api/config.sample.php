<?php

/**
 * Copy this file to config.php on the DreamHost server and fill in real values.
 * config.php is gitignored — never commit secrets.
 *
 * FROM / SMTP_USER must be the Google Workspace address that owns the App Password.
 * TO is who receives submissions. BCC is optional (comma-separated).
 */

return [
    // Workspace address that sends via smtp.gmail.com (also used as SMTP From)
    'FROM' => 'you@your-agency.com',
    'FROM_NAME' => 'New32 Website',

    // Where submissions are delivered
    'TO' => 'you@your-agency.com',

    // Optional: comma-separated extra recipients (empty on staging)
    // Production example:
    // 'BCC' => 'drshaw@new32dental.com,drjacobsen@new32dental.com,Elizabetheshaw@gmail.com,info@new32dental.com',
    'BCC' => '',

    // Gmail SMTP. SMTP_USER defaults to FROM if left empty.
    'SMTP_USER' => '',
    'SMTP_PASSWORD' => 'xxxx xxxx xxxx xxxx',

    // Optional: comma-separated Allowed Origins for CORS (leave empty to omit CORS headers)
    // Example: 'https://new32dental.com,https://www.new32dental.com'
    'ALLOWED_ORIGINS' => '',

    // Rate limit: max submissions per IP per window
    'RATE_LIMIT_MAX' => 5,
    'RATE_LIMIT_WINDOW_SECONDS' => 3600,
];
