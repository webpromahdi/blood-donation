Build all Admin dashboard pages. Use DashboardLayout for every page.

Admin sidebarItems:
[
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Donors", path: "/admin/donors" },
  { icon: Building2, label: "Hospitals", path: "/admin/hospitals" },
  { icon: HandHeart, label: "Voluntary Donations", path: "/admin/voluntary" },
  { icon: Droplet, label: "Blood Groups", path: "/admin/blood-groups" },
  { icon: BarChart2, label: "Reports", path: "/admin/reports" },
  { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
  { icon: MessageSquare, label: "Chat", path: "/admin/chat", badge: true },
  { icon: Bell, label: "Notifications", path: "/admin/notifications", badge: true },
  { icon: User, label: "Profile", path: "/admin/profile" }
]

─────────────────────────────────────
src/pages/admin/Dashboard.jsx
─────────────────────────────────────
4 StatCards: Total Donors(12,450) | Total Hospitals(234) | Pending Approvals(28, yellow) | Active Requests(156, green)

Charts:
- Row 1: Bar (col-2) "Monthly Donations 2025" + Doughnut (col-1) "Blood Group Distribution"
- Row 2: Full-width Line "Blood Request Trends (12 months)"

Quick Actions: 4 button cards (Approve Pending | New Announcement | View Reports | Export Data)

Recent Activity (grid-cols-2):
Left: "Recent Registrations" — 5 items list (avatar + name + blood group + "X minutes ago" + status badge)
Right: "Recent Blood Requests" — 5 items (blood group badge + patient + hospital + urgency badge + time)

─────────────────────────────────────
src/pages/admin/Donors.jsx
─────────────────────────────────────
PageHeader "Manage Donors" + "Export CSV" Button outline right

Filter bar (collapsible panel toggle):
- Search input (name/email/phone)
- Blood Group select
- Status select (All/Pending/Approved/Suspended/Rejected)
- Division select
- Apply + Reset buttons

Counts row: "Total: 12,450 | Pending: 28 | Approved: 12,180 | Suspended: 242"

Table:
Cols: # | Name+Avatar | Email | Blood Group | Phone | Division | Status | Registered | Actions
Actions: 3-dot MoreVertical dropdown menu:
  View Profile | Approve (if pending) | Suspend | Reject | Delete
Each action: icon + label

Approve modal: confirm text + "Approve" Button primary
Reject modal: reason textarea + "Reject" Button danger
Suspend modal: reason + duration select + "Suspend" Button warning
Delete: red confirm modal "This cannot be undone"

Pagination at bottom

─────────────────────────────────────
src/pages/admin/Hospitals.jsx
─────────────────────────────────────
PageHeader + "Add Hospital" Button primary right → opens Modal with hospital form

Same filter/table pattern as Donors:
Table cols: # | Hospital Name | Type | License | Division | Contact Person | Status | Actions
Hospital form (in Modal): Name | Type select | License No | Division | District | Address | Contact Email | Contact Phone

─────────────────────────────────────
src/pages/admin/Voluntary.jsx
─────────────────────────────────────
Filter bar: Date range | Hospital | Blood Group | Status | Donor name search

Stats row: Total Scheduled | Completed | Pending | This Month

Table: Donor Name | Blood Group | Hospital | Date | Time | Type | Units | Status | Actions (View/Cancel)

Charts below: Bar "Monthly by Blood Group" + Doughnut "Donation Types"

─────────────────────────────────────
src/pages/admin/BloodGroups.jsx
─────────────────────────────────────
8-card grid (grid-cols-2 lg:grid-cols-4):
Each blood group card (border rounded-md p-5):
- BloodGroupBadge size=lg
- "X Donors" large number
- "X Active this month"
- Status badge: Critical(red) / Low(orange) / Adequate(green) / Surplus(blue)
- Progress bar (supply/demand ratio)
- "Update Inventory" Button sm outline

Below: Table "Blood Inventory Log"
Cols: Blood Group | Total Donors | Active | Donated (units) | Pending Requests | Status | Last Updated
Sort by any column

─────────────────────────────────────
src/pages/admin/Reports.jsx
─────────────────────────────────────
Top: date range picker row + "Apply" Button + quick ranges (7D / 30D / 90D / 1Y pills) + Export PDF Button + Export CSV Button

Collapsible filter: Blood Group | Status | Division | "Apply Filters"

4 KPI Cards: Total Requests | Fulfilled | Success Rate % | Avg Response Time(hrs)

Charts (stacked sections):
1. Dual Bar: "Donations vs Requests Monthly"
2. Line: "Weekly Trends"
3. Row of 2: Doughnut "Status Breakdown" + Horizontal Bar "Top 5 Hospitals"

Data table at bottom:
Cols: Request ID | Donor | Seeker | Blood Group | Hospital | Date | Status badge | Response Time
Search + Pagination

─────────────────────────────────────
src/pages/admin/Announcements.jsx
─────────────────────────────────────
Grid grid-cols-1 lg:grid-cols-2 gap-8:

Left: Announcements list
Each card (border rounded-md p-4 mb-4):
  Type badge (General=blue/Emergency=red/Event=green/Maintenance=gray)
  Title font-semibold + date text-xs text-gray-400
  Message preview (2-line clamp)
  Status badge (Active/Scheduled/Expired) + Edit button + Delete button
  Emergency type: red left border accent

Right: "Create Announcement" form card (border rounded-md p-6)
  Input Title
  Select Type (General/Emergency/Event/Maintenance)
  Textarea Message (rows=6)
  Select Target (All Users/Donors Only/Hospitals Only/Seekers Only)
  Input type=datetime-local "Schedule Date (optional)"
  Toggle "Publish Immediately"
  "Publish" Button primary fullWidth loading

─────────────────────────────────────
src/pages/admin/Profile.jsx — same as Donor Profile
+ Extra section: "System Preferences" card
  - Email notifications toggle
  - SMS notifications toggle  
  - System alerts toggle
  - Theme preference select (saved)

src/pages/admin/Chat.jsx — same pattern as Donor Chat
src/pages/admin/Notifications.jsx — same pattern as Donor Notifications

STRICT DESIGN RULES:
- rounded-md only everywhere
- All tables: sortable headers (click to sort), hover row highlight, pagination
- All modals: rounded-md, dark mode
- Dark mode everywhere
