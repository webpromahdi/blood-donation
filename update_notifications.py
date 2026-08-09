import os

files = [
    'client/src/pages/donor/Notifications.jsx',
    'client/src/pages/seeker/Notifications.jsx',
    'client/src/pages/hospital/Notifications.jsx',
    'client/src/pages/admin/Notifications.jsx',
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    role = file_path.split('/')[3]
    
    # 1. Add imports
    if 'useNavigate' not in content:
        content = content.replace("import { api } from '../../utils/apiService'", 
            "import { api } from '../../utils/apiService'\nimport { useNavigate } from 'react-router-dom'\nimport { getNotificationRoute } from '../../utils/notificationUtils'")

    # 2. Add navigate to component
    if 'const navigate = useNavigate()' not in content:
        content = content.replace('const [loading, setLoading] = useState(true)', 
            'const [loading, setLoading] = useState(true)\n  const navigate = useNavigate()')

    # 3. Replace markAsRead with handleNotificationClick
    import re
    # Match the entire markAsRead function
    mark_as_read_regex = re.compile(r'  const markAsRead = async \(id, isRead\) => \{.*?\n  \}', re.DOTALL)
    
    replacement = f"""  const handleNotificationClick = async (n) => {{
    if (!n.read) {{
      try {{
        await api.post('/notifications/mark-read.php', {{ notification_id: n.id }})
        setItems((prev) => prev.map((x) => x.id === n.id ? {{ ...x, read: true }} : x))
      }} catch (err) {{
        console.error('Failed to mark as read:', err)
      }}
    }}
    const route = getNotificationRoute(n, '{role}')
    navigate(route)
  }}"""

    content = mark_as_read_regex.sub(replacement, content)

    # 4. Replace onClick in JSX
    # From onClick={() => markAsRead(n.id, n.read)} to onClick={() => handleNotificationClick(n)}
    # And add hover styles
    content = re.sub(
        r'onClick=\{.*?markAsRead\(.*?\}\s+className=\{`flex cursor-pointer items-start gap-4 rounded-md border border-gray-200 p-4',
        r'onClick={() => handleNotificationClick(n)}\n                className={`flex cursor-pointer items-start gap-4 rounded-md border border-gray-200 p-4 hover:bg-gray-50',
        content
    )

    with open(file_path, 'w') as f:
        f.write(content)

print("Updated all Notifications.jsx files")
