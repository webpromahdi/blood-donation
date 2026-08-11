<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Achievement Certificate Download Endpoint
 * GET /api/donor/certificates/achievement.php?tier=Bronze&required=1
 * Downloads an HTML certificate for reaching a donation milestone
 */

// Start output buffering to prevent any accidental output before headers
ob_start();

// Start session FIRST before any output or headers
if (session_status() === PHP_SESSION_NONE) {
}

// Handle CORS - use specific origin for credentials support
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Validate user is logged in as donor
$user = requireAuth(['donor']);

// Require approved status
requireApprovedStatus($_SESSION['user_id'], 'donor');

$donorId = $_SESSION['user_id'];

// Validate tier parameter
$validTiers = ['Bronze' => 1, 'Silver' => 3, 'Gold' => 5, 'Platinum' => 10, 'Diamond' => 25];

if (!isset($_GET['tier']) || !array_key_exists($_GET['tier'], $validTiers)) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing tier']);
    exit;
}

$tierName = $_GET['tier'];
$requiredDonations = $validTiers[$tierName];

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Get donor's profile from normalized tables
    $stmt = $conn->prepare("
        SELECT u.name, bg.blood_type as blood_group, d.id as donor_id
        FROM users u
        JOIN donors d ON u.id = d.user_id
        LEFT JOIN blood_groups bg ON d.blood_group_id = bg.id
        WHERE u.id = ?
    ");
    $stmt->execute([$donorId]);
    $donor = $stmt->fetch();

    if (!$donor) {
        ob_end_clean();
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Donor not found']);
        exit;
    }
    
    $donorRecordId = $donor['donor_id'];

    // Count completed donations using donor_id (donors.id)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM donations WHERE donor_id = ? AND status = 'completed'");
    $stmt->execute([$donorRecordId]);
    $result = $stmt->fetch();
    $totalDonations = (int) $result['total'];

    // Verify donor has enough donations for this tier
    if ($totalDonations < $requiredDonations) {
        ob_end_clean();
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => "You need {$requiredDonations} donations to unlock the {$tierName} certificate. You have {$totalDonations}."
        ]);
        exit;
    }

    // Get the date when they reached this milestone (date of Nth completed donation)
    $stmt = $conn->prepare("
        SELECT completed_at 
        FROM donations 
        WHERE donor_id = ? AND status = 'completed' 
        ORDER BY completed_at ASC 
        LIMIT 1 OFFSET ?
    ");
    $stmt->execute([$donorRecordId, $requiredDonations - 1]);
    $milestoneRow = $stmt->fetch();
    $milestoneDate = $milestoneRow ? date('F j, Y', strtotime($milestoneRow['completed_at'])) : date('F j, Y');

    // Generate certificate ID
    $certId = 'ACH-' . strtoupper(substr($tierName, 0, 3)) . '-' . $donorId . '-' . date('Y');

    // Generate HTML certificate
    $certificateHtml = generateAchievementCertificateHtml(
        $donor['name'],
        $donor['blood_group'],
        $tierName,
        $requiredDonations,
        $totalDonations,
        $milestoneDate,
        $certId
    );

    // Clear output buffer before sending file
    ob_end_clean();

    // Set headers for file download
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: inline; filename="certificate-' . strtolower($tierName) . '-milestone.html"');
    header('Content-Length: ' . strlen($certificateHtml));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    echo $certificateHtml;
    exit;

} catch (PDOException $e) {
    ob_end_clean();
    error_log("Achievement Certificate Error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to generate certificate']);
    exit;
}

function generateAchievementCertificateHtml($donorName, $bloodGroup, $tierName, $requiredDonations, $totalDonations, $milestoneDate, $certId) {
    $currentYear = date('Y');
    $donationPlural = $requiredDonations > 1 ? 's' : '';
    
    // Tier-specific accent color
    $tierColors = [
        'Bronze' => '#B8860B',
        'Silver' => '#94A3B8',
        'Gold'   => '#D4AF37',
        'Platinum' => '#64748B',
        'Diamond' => '#38BDF8',
    ];
    $accentColor = $tierColors[$tierName] ?? '#B8860B';
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{$tierName} Achievement Certificate - BloodConnect</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #e5e5e5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .certificate {
            background: #FFFAF0; /* Warm Ivory */
            width: 800px;
            height: 1122px;
            display: flex;
            flex-direction: column;
            position: relative;
            margin: 0 auto;
            padding: 50px;
            /* Outer thin accent border */
            border: 1px solid {$accentColor};
        }

        /* Inner subtle red border */
        .certificate-inner {
            border: 2px solid #B91C1C;
            height: 100%;
            position: relative;
            padding: 60px 50px 70px 50px;
            display: flex;
            flex-direction: column;
        }

        /* Corner ornaments */
        .corner {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 2px solid {$accentColor};
        }
        .corner-tl { top: -8px; left: -8px; border-right: none; border-bottom: none; }
        .corner-tr { top: -8px; right: -8px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: -8px; left: -8px; border-right: none; border-top: none; }
        .corner-br { bottom: -8px; right: -8px; border-left: none; border-top: none; }

        /* Background Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.03;
            width: 450px;
            height: 450px;
            pointer-events: none;
            z-index: 1;
        }
        .watermark svg {
            width: 100%;
            height: 100%;
            fill: #B91C1C;
        }

        /* Content wrapper */
        .content-wrapper {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            height: 100%;
            align-items: center;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            margin-top: 10px;
            width: 100%;
        }

        .brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .brand-icon {
            width: 28px;
            height: 28px;
            color: #B91C1C;
        }

        .brand-text {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            color: #B91C1C;
            letter-spacing: 2px;
        }

        .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 42px;
            font-weight: 700;
            color: {$accentColor};
            letter-spacing: 6px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .cert-subtitle {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-style: italic;
            color: #4B5563;
            letter-spacing: 1px;
        }

        /* Body Content */
        .awarded-to {
            font-family: 'Lato', sans-serif;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #6B7280;
            margin-bottom: 15px;
        }

        .donor-name {
            font-family: 'Playfair Display', serif;
            font-size: 46px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid {$accentColor};
            width: 80%;
            text-align: center;
        }

        .recognition-msg {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 16px;
            line-height: 1.8;
            color: #374151;
            text-align: center;
            max-width: 560px;
            margin-bottom: 25px;
        }

        /* Achievement Box */
        .achievement-box {
            background: linear-gradient(135deg, #FFFAF0 0%, #fdf5e6 100%);
            border: 1px solid {$accentColor};
            padding: 18px 40px;
            text-align: center;
            margin-bottom: 35px;
            position: relative;
            width: 80%;
            max-width: 480px;
        }

        .achievement-box::before {
            content: '';
            position: absolute;
            top: 4px; left: 4px; right: 4px; bottom: 4px;
            border: 1px solid {$accentColor};
            opacity: 0.3;
        }

        .trophy-icon {
            width: 32px;
            height: 32px;
            color: {$accentColor};
            margin-bottom: 12px;
        }

        .achievement-title {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }

        .achievement-desc {
            font-family: 'Lato', sans-serif;
            font-size: 14px;
            color: #4B5563;
            letter-spacing: 0.5px;
        }

        /* Stats */
        .stats-container {
            display: flex;
            justify-content: center;
            gap: 70px;
            width: 100%;
            margin-bottom: 40px;
        }

        .stat-item {
            text-align: center;
            position: relative;
        }

        .stat-item:not(:last-child)::after {
            content: '';
            position: absolute;
            right: -35px;
            top: 15%;
            height: 70%;
            width: 1px;
            background: #D1D5DB;
        }

        .stat-value {
            font-family: 'Cinzel', serif;
            font-size: 36px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 6px;
        }

        .stat-label {
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #6B7280;
        }

        /* Footer */
        .footer {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: auto;
        }

        .signature-block {
            text-align: center;
            width: 220px;
        }

        .signature-img {
            width: 120px;
            height: 40px;
            margin: 0 auto 5px;
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 24px;
            color: #1F2937;
            line-height: 40px;
            border-bottom: 1px solid #1F2937;
        }

        .signature-label {
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #6B7280;
            margin-top: 8px;
        }

        .cert-meta {
            text-align: right;
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            color: #6B7280;
            line-height: 1.6;
        }

        .cert-meta strong {
            color: #1F2937;
            letter-spacing: 1px;
            font-size: 12px;
            display: block;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-inner">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <div class="watermark">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
            
            <div class="content-wrapper">
                <div class="header">
                    <div class="brand">
                        <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span class="brand-text">BLOODCONNECT</span>
                    </div>
                    
                    <h1 class="cert-title">{$tierName} Donor</h1>
                    <p class="cert-subtitle">Achievement Certificate</p>
                </div>
                
                <p class="awarded-to">This certificate is proudly awarded to</p>
                <h2 class="donor-name">{$donorName}</h2>
                
                <p class="recognition-msg">
                    In recognition of your extraordinary commitment to saving lives through blood donation. 
                    Your generosity and dedication make a meaningful difference in our community and serve 
                    as an inspiration to others.
                </p>
                
                <div class="achievement-box">
                    <svg class="trophy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                    <div class="achievement-title">{$tierName} Milestone Achieved</div>
                    <div class="achievement-desc">Successfully completed {$requiredDonations} blood donation{$donationPlural}</div>
                </div>
                
                <div class="stats-container">
                    <div class="stat-item">
                        <div class="stat-value">{$totalDonations}</div>
                        <div class="stat-label">Total Donations</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{$bloodGroup}</div>
                        <div class="stat-label">Blood Type</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{$requiredDonations}+</div>
                        <div class="stat-label">Milestone</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="signature-block">
                        <div class="signature-img">BloodConnect</div>
                        <div class="signature-label">Authorized Signature</div>
                    </div>
                    
                    <div class="cert-meta">
                        <strong>CERTIFICATE ID</strong>
                        {$certId}<br>
                        Achieved: {$milestoneDate}<br>
                        © {$currentYear} BloodConnect
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
        window.onload = function() {
            const element = document.querySelector('.certificate');
            const opt = {
                margin:       0,
                filename:     'certificate-{$tierName}-milestone.pdf',
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(element).save().then(() => {
                setTimeout(() => window.close(), 500);
            });
        }
    </script>
</body>
</html>
HTML;
}
?>
