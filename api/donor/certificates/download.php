<?php
require_once __DIR__ . '/../../config/cors.php';
/**
 * Certificate Download Endpoint
 * GET /api/donor/certificates/download.php?donation_id=X
 * Downloads an HTML certificate for a completed donation
 */

// Start output buffering to prevent any accidental output before headers
ob_start();

// Start session FIRST before any output or headers
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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

// Validate donation_id parameter
if (!isset($_GET['donation_id']) || !is_numeric($_GET['donation_id'])) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing donation ID']);
    exit;
}

$donationId = (int) $_GET['donation_id'];

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
    // Get donor_id from donors table (normalized schema)
    $stmt = $conn->prepare("SELECT id FROM donors WHERE user_id = ?");
    $stmt->execute([$donorId]);
    $donorRecord = $stmt->fetch();
    
    if (!$donorRecord) {
        ob_end_clean();
        error_log("Certificate download failed: Donor record not found for user $donorId");
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Donor record not found']);
        exit;
    }
    
    $donorRecordId = $donorRecord['id'];

    // Fetch donation with all required data using normalized schema
    // donations.donor_id references donors.id (not users.id)
    $sql = "SELECT 
                dn.id AS donation_id,
                dn.status,
                dn.completed_at,
                u.name AS donor_name,
                bg.blood_type AS blood_group,
                r.hospital_name,
                r.request_code
            FROM donations dn
            JOIN donors d ON dn.donor_id = d.id
            JOIN users u ON d.user_id = u.id
            JOIN blood_groups bg ON d.blood_group_id = bg.id
            JOIN blood_requests r ON dn.request_id = r.id
            WHERE dn.id = ? AND dn.donor_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$donationId, $donorRecordId]);
    $donation = $stmt->fetch();

    // Check if donation exists and belongs to this donor
    if (!$donation) {
        ob_end_clean();
        error_log("Certificate download failed: Donation $donationId not found for donor $donorId");
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Donation not found or access denied']);
        exit;
    }

    // Check if donation is completed
    if ($donation['status'] !== 'completed') {
        ob_end_clean();
        error_log("Certificate download failed: Donation $donationId status is '{$donation['status']}', not completed");
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Certificate is only available for completed donations']);
        exit;
    }

    // Generate certificate ID and formatted donation ID
    $formattedDonationId = 'DON' . str_pad($donation['donation_id'], 3, '0', STR_PAD_LEFT);
    $certId = 'CERT-' . date('Y', strtotime($donation['completed_at'])) . '-' . $formattedDonationId;
    $donationDate = date('F j, Y', strtotime($donation['completed_at']));

    // Generate HTML certificate
    $certificateHtml = generateCertificateHtml(
        $donation['donor_name'],
        $donation['blood_group'],
        $donationDate,
        $donation['hospital_name'],
        $formattedDonationId,
        $certId
    );

    // Clear output buffer before sending file
    ob_end_clean();
    
    error_log("Certificate download success: Generating certificate for donation $donationId");

    // Set headers for file download
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: inline; filename="certificate-' . $formattedDonationId . '.html"');
    header('Content-Length: ' . strlen($certificateHtml));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    echo $certificateHtml;
    exit;

} catch (PDOException $e) {
    ob_end_clean();
    error_log("Certificate Download Error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to generate certificate']);
    exit;
}

function generateCertificateHtml($donorName, $bloodGroup, $donationDate, $hospitalName, $formattedDonationId, $certId) {
    $currentYear = date('Y');
    $accentColor = '#B91C1C'; // Deep Blood Red
    $secondaryAccent = '#D4AF37'; // Gold
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Donation Certificate - BloodConnect</title>
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
            border: 1px solid {$secondaryAccent};
        }

        /* Inner subtle red border */
        .certificate-inner {
            border: 2px solid {$accentColor};
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
            border: 2px solid {$secondaryAccent};
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
            fill: {$accentColor};
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
            color: {$accentColor};
        }

        .brand-text {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            color: {$accentColor};
            letter-spacing: 2px;
        }

        .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 38px;
            font-weight: 700;
            color: {$accentColor};
            letter-spacing: 4px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .cert-subtitle {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
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
            margin-top: 5px;
        }

        .donor-name {
            font-family: 'Playfair Display', serif;
            font-size: 46px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid {$secondaryAccent};
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

        /* Donation Box */
        .donation-box {
            background: linear-gradient(135deg, #FFFAF0 0%, #fdf5e6 100%);
            border: 1px solid {$secondaryAccent};
            padding: 22px 40px;
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            width: 80%;
            max-width: 550px;
        }

        .donation-box::before {
            content: '';
            position: absolute;
            top: 4px; left: 4px; right: 4px; bottom: 4px;
            border: 1px solid {$secondaryAccent};
            opacity: 0.3;
        }
        
        .donation-detail-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
        }

        .donation-detail {
            text-align: center;
        }
        
        .donation-value {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 5px;
        }

        .donation-label {
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1.5px;
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
                    
                    <h1 class="cert-title">Certificate of Heroism</h1>
                    <p class="cert-subtitle">For the priceless gift of life</p>
                </div>
                
                <p class="awarded-to">This certificate is proudly awarded to</p>
                <h2 class="donor-name">{$donorName}</h2>
                
                <p class="recognition-msg">
                    In deepest appreciation of your voluntary and life-saving blood donation.
                    Your selflessness provides hope and healing to those in critical need, 
                    exemplifying the highest form of compassion in our community.
                </p>
                
                <div class="donation-box">
                    <div class="donation-detail-row">
                        <div class="donation-detail">
                            <div class="donation-value">{$bloodGroup}</div>
                            <div class="donation-label">Blood Type</div>
                        </div>
                        <div class="donation-detail">
                            <div class="donation-value">{$donationDate}</div>
                            <div class="donation-label">Date of Donation</div>
                        </div>
                        <div class="donation-detail">
                            <div class="donation-value">{$hospitalName}</div>
                            <div class="donation-label">Recipient Center</div>
                        </div>
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
                        Issued: {$donationDate}<br>
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
                filename:     'certificate-{$formattedDonationId}.pdf',
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
