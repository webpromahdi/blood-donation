Build all Donor dashboard pages. Use DashboardLayout for every page.

Donor sidebarItems array (define in each page or a shared constant):
[
  { icon: LayoutDashboard, label: "Dashboard", path: "/donor/dashboard" },
  { icon: Heart, label: "Health Info", path: "/donor/health" },
  { icon: Calendar, label: "Donate Voluntarily", path: "/donor/voluntary" },
  { icon: FileText, label: "Donation History", path: "/donor/history" },
  { icon: Award, label: "Certificates", path: "/donor/certificates" },
  { icon: MessageSquare, label: "Chat", path: "/donor/chat", badge: true },
  { icon: Bell, label: "Notifications", path: "/donor/notifications", badge: true },
  { icon: User, label: "Profile", path: "/donor/profile" }
]

─────────────────────────────────────
src/pages/donor/Dashboard.jsx
─────────────────────────────────────
<DashboardLayout sidebarItems={...} role="donor" currentPath="/donor/dashboard" pageTitle="Dashboard">

1. PageHeader title="Donor Dashboard" subtitle="Welcome back, Rahim! Thank you for saving lives."
   Action: Badge "Account Active" green

2. Pending Approval Banner (useState showPending=false toggle for demo):
   bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3
   Clock icon (amber) + "Account Under Review" + explanation + "Dismiss" button

3. 4 StatCards (grid-cols-2 lg:grid-cols-4):
   - Total Donations: 12, droplet icon red, "+2 this year"
   - Lives Saved: 36 (×3), heart icon pink
   - Donation Streak: 4, flame icon orange, "consecutive donations"
   - Next Eligible: "Jan 15" (or "Eligible Now!"), calendar icon blue

4. Next Donation Countdown card:
   bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md p-6
   Left: "You can donate again in" + "45 days" (text-5xl font-bold)
   Right: progress bar (white bg-opacity, filled portion = red-400, shows 50% of 90 days)

5. Charts row (grid-cols-1 lg:grid-cols-3):
   Left (col-span-2): Bar chart "Monthly Donations — 2025" (Chart.js, 12 months, red bars)
   Right (col-span-1): Doughnut "Blood Groups Donated" (4 groups)
   All charts: react-chartjs-2 components, dark mode aware colors

6. Recent Donations table (bg-white dark:bg-gray-800 border rounded-md):
   Table headers: Date | Hospital | Blood Group | Units | Status | Certificate
   5 mock rows, Status Badge, Certificate download icon button
   Footer: "View Full History →" link

7. Badges row (bg-white dark:bg-gray-800 border rounded-md p-5):
   H3 "My Achievements" + 5 badge circles
   Earned: colored bg + icon; Locked: gray opacity-50

─────────────────────────────────────
src/pages/donor/Health.jsx
─────────────────────────────────────
2-column grid lg:grid-cols-3:

Left (col-span-2): "Health Information" form card
- 2-col grid for fields:
  Blood Group (read-only display), Weight (kg), Height (cm), BMI (auto-calculated, read-only green/red)
  Blood Pressure: "120 / 80" two inputs
  Hemoglobin (g/dL)
  Medical Conditions (multi-select: tag pills with X remove)
  Allergies (textarea)
  Medications (textarea)
  Last Medical Checkup (date input)
- "Save Health Info" Button primary + loading state

Right (col-span-1):
"Eligibility Status" card:
  Large colored status: "Eligible to Donate" (green CheckCircle) or "Not Eligible" (red X)
  Checklist of 4 criteria with check/x

"Health Tips" card (mt-6):
  3 tip items: icon + title + short tip
  Tips: Stay hydrated | Iron-rich foods | Regular checkup

─────────────────────────────────────
src/pages/donor/Voluntary.jsx
─────────────────────────────────────
Grid grid-cols-1 lg:grid-cols-2 gap-8:

Left: "Schedule a Voluntary Donation" card (border rounded-md p-6)
Form:
- Select Hospital (from mock list of 5 hospitals)
- Date: Input type=date
- Time: Input type=time
- Donation Type: Select (Whole Blood / Platelets / Plasma / Double Red Cells)
- Units: Input type=number min=1 max=5
- Notes: textarea optional
- "Schedule Donation" Button primary fullWidth loading

Success state: green card "Appointment scheduled!" with date/hospital summary

Right: "My Upcoming Appointments"
Appointment cards (3 mock):
Each: border rounded-md p-4 flex justify-between items-start
  Left: Hospital name (font-medium) + date + time + type
  Right: Status badge + Cancel button (ghost)
  If status pending: amber badge; confirmed: green badge

─────────────────────────────────────
src/pages/donor/History.jsx
─────────────────────────────────────
PageHeader + filter bar:
- Date range (from–to date inputs)
- Blood Group filter
- Status filter
- "Apply" Button + "Reset" link

Summary stats: 3 inline stats (Total | This Year | Avg/Year)

Table (bg-white dark:bg-gray-800 border rounded-md):
Cols: # | Date | Hospital | Blood Group | Type | Units | Status | Certificate
10 mock rows, all with realistic data
Status: Completed(green)/Pending(yellow)/Cancelled(gray)
Certificate: Download icon button (disabled if not completed)

Pagination at bottom

─────────────────────────────────────
src/pages/donor/Certificates.jsx
─────────────────────────────────────
PageHeader "My Certificates"

Grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6:
6 certificate cards (ALL same height):
Card (border-t-4 border-red-600 rounded-md p-5 bg-white dark:bg-gray-800):
- "Certificate of Appreciation" badge (small, red, top)
- "BLOOD DONATION CERTIFICATE" h3 mt-3
- Decorative red heart divider
- Donor name (large)
- Date + Hospital text-sm text-gray-600
- Blood Group badge
- Certificate No: "#BC-2025-001"
- Verified: CheckCircle green + "Verified Authentic"
- Actions: Download PDF (Button primary sm) + Share (Button outline sm)

Empty state (if no certs): centered illustration placeholder + text + "Start Donating" CTA

─────────────────────────────────────
src/pages/donor/Chat.jsx
─────────────────────────────────────
Full height layout: h-[calc(100vh-64px)] flex

Left panel (w-80 border-r flex-shrink-0 hidden lg:flex flex-col):
- Search input
- Conversation list (overflow-y-auto flex-1):
  Each item (py-3 px-4 border-b hover:bg-gray-50 cursor-pointer flex gap-3):
  Avatar (colored initials) + Name + time (right) + last message (text-sm text-gray-500) + unread badge (red)
  Active: bg-red-50 dark:bg-red-950/30

Right panel (flex-1 flex flex-col):
Header (border-b p-4 flex items-center gap-3): Avatar + Name + "Online" green dot
Messages area (flex-1 overflow-y-auto p-4 flex flex-col gap-3):
  Received: bg-gray-100 dark:bg-gray-700 rounded-md rounded-tl-none p-3 max-w-xs self-start
  Sent: bg-red-600 text-white rounded-md rounded-tr-none p-3 max-w-xs self-end
  Date separator: centered text-xs text-gray-400
Input bar (border-t p-4 flex gap-3): Input + Send Button primary icon-only

Mobile: show list OR chat with back button

─────────────────────────────────────
src/pages/donor/Notifications.jsx
─────────────────────────────────────
PageHeader + "Mark all read" button right

Filter tabs: All | Unread | Blood Requests | System

Notifications list (space-y-2):
Each item (bg-white dark:bg-gray-800 border rounded-md p-4 flex gap-4 cursor-pointer):
- Icon in colored circle (size-10 rounded-full)
- Title (font-medium) + Description (text-sm text-gray-600)
- Time (text-xs text-gray-400 ml-auto)
- Unread: left-2px border-red-600, bg slightly tinted

5 mock notifications per category type

─────────────────────────────────────
src/pages/donor/Profile.jsx
─────────────────────────────────────
Grid grid-cols-1 lg:grid-cols-3 gap-6:

Left (col-span-1):
Card (border rounded-md p-6 text-center):
- Avatar: size-24 rounded-full mx-auto relative
  Camera icon button (absolute bottom-0 right-0, size-8, bg-red-600 text-white rounded-full)
- Name h2 + BloodGroupBadge + "Member since 2023"
- Donor level badge: "Platinum Donor" (red/gold)
- 3 mini stats: Donations | Lives Saved | Rank

Right (col-span-2 space-y-6):
Card 1: "Personal Information" (border rounded-md p-6)
  Grid 2-col form: Full Name | Phone | Email (disabled) | DOB | Gender | Division | District | Address (col-span-2)
  "Save Changes" Button primary loading + success toast

Card 2: "Availability Settings" (border rounded-md p-6)
  Toggle switch: "Available for Donation"
  Green = Available, Gray = Unavailable
  Subtext: "Seekers can contact you when enabled"

Card 3: "Change Password" (border rounded-md p-6)
  Current Password | New Password (strength bar) | Confirm Password
  "Update Password" Button outline

STRICT DESIGN RULES for all donor pages:
- DashboardLayout wraps every page
- rounded-md only everywhere
- Chart.js with react-chartjs-2
- Dark mode on all elements
- Validation + loading states on all forms
- Tables have hover states
