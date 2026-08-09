import re

with open('api/notifications/list.php', 'r') as f:
    content = f.read()

# 1. Add TIMESTAMPDIFF to SQL
content = content.replace(
    'is_read,\n            read_at,\n            created_at\n        FROM notifications',
    'is_read,\n            read_at,\n            created_at,\n            TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_ago\n        FROM notifications'
)

# 2. Update timeAgo logic
old_time_logic = """        // Format time ago
        $createdAt = new DateTime($n['created_at']);
        $now = new DateTime();
        $diff = $now->diff($createdAt);
        
        if ($diff->days > 7) {
            $timeAgo = $createdAt->format('M j, Y');
        } elseif ($diff->days > 0) {
            $timeAgo = $diff->days . ' day' . ($diff->days > 1 ? 's' : '') . ' ago';
        } elseif ($diff->h > 0) {
            $timeAgo = $diff->h . ' hour' . ($diff->h > 1 ? 's' : '') . ' ago';
        } elseif ($diff->i > 0) {
            $timeAgo = $diff->i . ' minute' . ($diff->i > 1 ? 's' : '') . ' ago';
        } else {
            $timeAgo = 'Just now';
        }"""

new_time_logic = """        // Format time ago using database diff
        $diffSeconds = (int)$n['seconds_ago'];
        
        if ($diffSeconds > 7 * 86400) {
            $timeAgo = (new DateTime($n['created_at']))->format('M j, Y');
        } elseif ($diffSeconds >= 86400) {
            $days = floor($diffSeconds / 86400);
            $timeAgo = $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } elseif ($diffSeconds >= 3600) {
            $hours = floor($diffSeconds / 3600);
            $timeAgo = $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($diffSeconds >= 60) {
            $mins = floor($diffSeconds / 60);
            $timeAgo = $mins . ' minute' . ($mins > 1 ? 's' : '') . ' ago';
        } else {
            $timeAgo = 'Just now';
        }"""

content = content.replace(old_time_logic, new_time_logic)

with open('api/notifications/list.php', 'w') as f:
    f.write(content)

print("Updated list.php")
