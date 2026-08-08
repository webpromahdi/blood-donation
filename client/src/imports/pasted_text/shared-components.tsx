Build all shared components for BloodConnect.
Project: React 18 + Vite, TailwindCSS v4, lucide-react, react-router-dom v6.
Import constants from: @/utils/constants
Import hooks from: @/hooks/useTheme, @/hooks/useAuth

─────────────────────────────────────
1. src/components/ui/Button.jsx
─────────────────────────────────────
Props: variant, size, children, onClick, disabled, loading, type, className, fullWidth

Variants:
- primary: bg-red-600 hover:bg-red-700 text-white
- secondary: bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100
- outline: border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950
- ghost: hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300
- danger: bg-red-600 hover:bg-red-700 text-white

Sizes:
- sm: px-3 py-1.5 text-sm
- md: px-4 py-2 text-sm (default)
- lg: px-6 py-3 text-base

Always: rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
Loading state: show Loader2 spin icon inside button, disable pointer events
fullWidth: w-full

─────────────────────────────────────
2. src/components/ui/Input.jsx
─────────────────────────────────────
Props: label, placeholder, type, value, onChange, error, leftIcon, rightIcon, disabled, required, id, name

Structure:
- <label> connected via htmlFor to input id
- Input wrapper: relative flex items-center
- Input: w-full px-4 py-2.5 border rounded-md text-sm
  Focus: ring-2 ring-red-500 border-red-500
  Error: border-red-500 ring-red-500
  Default border: border-gray-300 dark:border-gray-600
- leftIcon: absolute left-3, input gets pl-10
- rightIcon: absolute right-3, input gets pr-10
- Error message: <p> text-red-500 text-xs mt-1
- Dark mode: bg-gray-800 border-gray-600 text-gray-100

─────────────────────────────────────
3. src/components/ui/Select.jsx
─────────────────────────────────────
Props: label, options (array of {value, label}), value, onChange, error, placeholder, required

Same styling as Input but <select> element.
ChevronDown icon absolutely positioned right.

─────────────────────────────────────
4. src/components/ui/Badge.jsx
─────────────────────────────────────
Props: children, variant, size

Variants: success(green), warning(yellow), danger(red), info(blue), neutral(gray), primary(red)
Size: sm (text-xs px-2 py-0.5), md (text-xs px-2.5 py-1)
Always: rounded-md font-medium inline-flex items-center

─────────────────────────────────────
5. src/components/ui/Modal.jsx
─────────────────────────────────────
Props: isOpen, onClose, title, children, size (sm/md/lg/xl), footer

Structure:
- Fixed full-screen backdrop: bg-black/50 backdrop-blur-sm z-50
- Centered card: bg-white dark:bg-gray-800 rounded-md shadow-xl
- Header: title + X close button
- Body: children with overflow-y-auto max-h-[70vh]
- Footer: optional action buttons area
- Close on backdrop click, Escape key
- Sizes: sm=max-w-sm, md=max-w-md (default), lg=max-w-lg, xl=max-w-2xl
- Entry animation: scale from 0.95 to 1

─────────────────────────────────────
6. src/components/ui/Skeleton.jsx
─────────────────────────────────────
Props: className, width, height, circle

Uses .skeleton CSS class from globals.css
circle: rounded-full, else rounded-md
Default: w-full h-4 rounded-md
Export also: SkeletonCard (full card skeleton pattern)
  SkeletonCard: p-6 border rounded-md with skeleton lines inside

─────────────────────────────────────
7. src/components/ui/Pagination.jsx
─────────────────────────────────────
Props: currentPage, totalPages, onPageChange, totalItems, itemsPerPage

Shows: "Showing X–Y of Z results" text
Buttons: Previous (ChevronLeft), page numbers, Next (ChevronRight)
Active page: bg-red-600 text-white
Inactive: border border-gray-300 hover:bg-gray-50 dark:border-gray-600
Max 5 page numbers visible with ... gaps
All: rounded-md size-9 flex items-center justify-center
Disable Previous on page 1, Next on last page

─────────────────────────────────────
8. src/components/ui/Toast.jsx
─────────────────────────────────────
Context-based toast system.
Export: ToastProvider, useToast

Toast types: success (green CheckCircle), error (red XCircle), warning (yellow AlertTriangle), info (blue Info)
Position: fixed bottom-4 right-4 z-[100] flex flex-col gap-2
Each toast: border rounded-md p-4 shadow-lg flex items-start gap-3 w-80
Auto-dismiss after 4s
X button to dismiss manually
Slide-in from right animation

─────────────────────────────────────
9. src/components/shared/ThemeToggle.jsx
─────────────────────────────────────
Imports useTheme from @/hooks/useTheme
Button: p-2 rounded-md border border-gray-300 dark:border-gray-600
Dark mode → show Sun icon (yellow hover)
Light mode → show Moon icon (gray)
onClick: toggleTheme()

─────────────────────────────────────
10. src/components/shared/BloodGroupBadge.jsx
─────────────────────────────────────
Props: group (string like "A+"), size (sm/md/lg)

Color map (import BLOOD_GROUP_COLORS from @/utils/constants):
A+/A-: bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300
B+/B-: bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300
AB+/AB-: bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300
O+/O-: bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300

Sizes: sm=text-xs px-2 py-0.5, md=text-sm px-2.5 py-1 (default), lg=text-base px-3 py-1.5
Always: rounded-md font-bold

─────────────────────────────────────
11. src/components/shared/StatCard.jsx
─────────────────────────────────────
Props: label, value, icon (Lucide component), iconBg, iconColor, change, changeType (up/down/neutral)

Design:
- bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6
- Hover: shadow-md transition-shadow
- Top row: left=label+value, right=icon in colored circle (size-12 rounded-md)
- Bottom: change text — up=green TrendingUp icon, down=red TrendingDown, neutral=gray
- value: text-3xl font-bold text-gray-900 dark:text-gray-100
- label: text-sm text-gray-500 dark:text-gray-400 mb-1

─────────────────────────────────────
12. src/components/shared/PageHeader.jsx
─────────────────────────────────────
Props: title, subtitle, action (optional JSX)

Design:
- mb-6 flex items-start justify-between flex-wrap gap-4
- Left: h1 text-2xl font-bold + p text-gray-500 mt-1
- Right: action button area

─────────────────────────────────────
13. src/components/shared/DonorCard.jsx
─────────────────────────────────────
Props: donor { name, bloodGroup, division, district, totalDonations, lastDonated, isAvailable, id }

SAME HEIGHT for ALL cards using: flex flex-col h-full

Card structure (bg-white dark:bg-gray-800 border rounded-md p-5):
- Top: Avatar circle (colored initials, size-14 rounded-full) + BloodGroupBadge top-right
- Name: text-lg font-semibold mt-3
- Location: MapPin icon + "district, division" text-sm text-gray-500
- Donations row: Droplet icon + "X donations" + Availability dot (●) green/gray
- Last donated: text-xs text-gray-400 mt-1
- Bottom (mt-auto pt-4): "View Profile" Button outline full-width
  Links to /donors/{id}

Avatar color: based on first letter of name (A-D=red, E-H=blue, I-L=green, M-P=purple, Q-T=orange, U-Z=teal)

─────────────────────────────────────
14. src/components/layout/PublicNavbar.jsx
─────────────────────────────────────
Fully responsive sticky navbar for public/guest pages.

Props: currentPage (string — matches nav link id)

State: isMobileMenuOpen (boolean)

Structure:
- <nav> sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm
- Container: max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between

LEFT — Logo:
- Link to /
- Heart icon (red fill) + "BloodConnect" (font-bold text-gray-900 dark:text-white) + "Save Lives" (text-xs text-gray-500)

CENTER — desktop nav (hidden on mobile, flex on lg+):
- Links: Home(/) | Find Donors(/donors) | About(/about) | Blog(/blog) | FAQ(/faq)
- Each: text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600
- Active: text-red-600 dark:text-red-400 with 2px red bottom border

RIGHT — desktop (hidden on mobile, flex on lg+):
- ThemeToggle component
- "Login" Button variant=outline size=sm, links to /login
- "Request Blood" Button variant=primary size=sm, links to /seeker/request

RIGHT — mobile (lg:hidden):
- ThemeToggle
- Hamburger button (Menu icon / X icon toggle), rounded-md p-2

MOBILE DRAWER:
- Fixed full-screen left side panel when open
- Backdrop: fixed inset-0 bg-black/50 z-40, click closes drawer
- Drawer: fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 z-50 shadow-xl
  sidebar-transition class
  Closed: -translate-x-full, Open: translate-x-0
- Drawer header: Logo + X close button
- Nav links stacked, each py-4 px-6 border-b text-base
- Bottom: Login + Request Blood buttons stacked, px-6 pb-6

─────────────────────────────────────
15. src/components/layout/PublicFooter.jsx
─────────────────────────────────────
Full-width dark footer.

<footer> bg-gray-900 dark:bg-slate-950 text-white

4-column grid (lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-10) — px-6 py-16 max-w-7xl mx-auto:

Col 1 — Brand:
- Heart icon + BloodConnect text (red-400)
- "Connecting donors with those in need, saving lives every day."
- Social icons row: Facebook, Twitter, Instagram, Linkedin (lucide) — rounded-md p-2 border border-gray-700 hover:border-red-500 hover:text-red-400

Col 2 — Quick Links (h4 + ul):
- Home | Find Donors | Why Donate | Eligibility | FAQ | Blog

Col 3 — Portals (h4 + ul):
- Login | Register | Track Request | Emergency: 999

Col 4 — Contact (h4 + ul with icons):
- Mail: info@bloodconnect.org
- Phone: 01700-000000
- Location: Dhaka, Bangladesh
- Hours: 24/7 Emergency Support

Bottom bar: border-t border-gray-800 py-6 flex flex-wrap justify-between gap-4
- "© 2025 BloodConnect. All rights reserved."
- Links: Privacy Policy | Terms of Service (text-gray-400 hover:text-white)

─────────────────────────────────────
16. src/components/layout/DashboardLayout.jsx
─────────────────────────────────────
Shared layout for ALL dashboard pages (donor, admin, hospital, seeker).

Props:
- children: page content
- sidebarItems: array of { icon: LucideComponent, label: string, path: string, badge?: boolean }
- role: 'donor' | 'admin' | 'hospital' | 'seeker'
- currentPath: string (active route)
- pageTitle: string

State: sidebarOpen (mobile toggle), notifOpen (notification dropdown), profileOpen (profile dropdown)

Import: useAuth from @/hooks/useAuth, useNavigate from react-router-dom

Role labels:
- donor → 'Donor Portal'
- admin → 'Admin Panel'
- hospital → 'Hospital Portal'
- seeker → 'Seeker Portal'

Profile routes per role:
- donor → /donor/profile
- admin → /admin/profile
- hospital → /hospital/profile
- seeker → /seeker/profile

─── SIDEBAR ───
- Position: fixed left-0 top-0 h-screen w-64 z-30
- bg: var(--color-sidebar-bg) border-r border-[var(--color-sidebar-border)]
- Mobile: sidebar-transition, -translate-x-full when closed, translate-x-0 when open
- Desktop (lg+): always visible translate-x-0

Header in sidebar:
- p-5 border-b
- Heart icon (red) + "BloodConnect" + role badge (text-xs gray)

Nav items (flex-1 overflow-y-auto py-2):
  Each <Link>:
  - Inactive: px-4 py-3 flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600
  - Active (currentPath === item.path): bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] border-r-2 border-red-600 font-medium
  - Icon: size-5
  - If badge: show a small red dot on the icon corner

Sidebar footer (p-4 border-t):
- "Emergency" text-xs text-gray-500 + "999" text-red-600 font-bold

Mobile backdrop: fixed inset-0 bg-black/50 z-20 when sidebarOpen (lg:hidden)

─── TOP HEADER ───
- Position: fixed top-0 left-0 lg:left-64 right-0 h-16 z-20
- bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
- px-4 lg:px-6 flex items-center justify-between h-full

Left:
- Mobile: Menu icon button (hamburger) toggles sidebarOpen
- Page title: pageTitle prop, text-lg font-semibold

Right (flex items-center gap-3):
1. ThemeToggle
2. Notification bell button:
   - relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700
   - Bell icon + absolute badge (red circle with count)
   - onClick: toggle notifOpen dropdown
   - Dropdown (absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border rounded-md shadow-xl z-50):
     Header: "Notifications" + "Mark all read" button
     Body: 4 mock notification items (icon + title + time + description)
     Footer: "View all notifications" link → /{role}/notifications
     Click outside closes dropdown

3. Profile section:
   - Avatar circle (size-9 rounded-full, colored with initials, bg red-100 text-red-700)
   - Name (hidden on small mobile) + ChevronDown
   - onClick: toggle profileOpen dropdown
   - Dropdown (absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-xl):
     - User icon + View Profile → /{role}/profile
     - Settings icon + Settings
     - Divider
     - LogOut icon + Logout (red text) → calls logout() + navigate('/login')

─── MAIN CONTENT ───
- ml-0 lg:ml-64 pt-16 min-h-screen bg-[var(--color-bg-secondary)]
- children rendered here

─────────────────────────────────────
17. src/pages/NotFound.jsx
─────────────────────────────────────
Full-screen centered 404 page:
- Large "404" text in red
- "Page Not Found" heading
- Description text
- "Go Home" Button primary → /
- "Go Back" Button outline → navigate(-1)
- Uses PublicNavbar + PublicFooter

STRICT DESIGN RULES:
- rounded-md ONLY. NEVER rounded-xl or rounded-2xl
- Colors: Primary #DC2626, dark bg #0F172A, gray scale only
- Icons: lucide-react only
- No lorem ipsum
- Dark mode on EVERY element
