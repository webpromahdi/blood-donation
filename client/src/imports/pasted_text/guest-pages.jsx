Build all public guest pages. Imports: PublicNavbar, PublicFooter, BloodGroupBadge, DonorCard, Button, Input, Badge from their paths.
Use Link from react-router-dom. Lucide-react icons.

─────────────────────────────────────
src/pages/guest/Donors.jsx — "Find a Blood Donor"
─────────────────────────────────────
Page title: "Find Blood Donors" + subtitle + "1,240 donors available" badge (green)

FILTER BAR (sticky top-16 bg-white dark:bg-gray-800 border-b py-4 px-4):
Flex wrap gap-3:
- Search Input (Search icon left) placeholder="Search by name, area..."
- Select Blood Group (All + 8 groups)
- Select Division (All + 8 Bangladesh divisions)
- Checkbox "Available Now" (toggle pill)
- Select Sort (Newest | Most Donations | Name A-Z)
- "Clear Filters" link text-red-600

RESULTS: text-sm text-gray-500 "Showing 12 of 1,240 donors"

Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6
12 DonorCard components with mock data (realistic Bengali names):

Mock donors array (12 items):
{ id: 1, name: "Rahim Khan", bloodGroup: "A+", division: "Dhaka", district: "Mirpur", totalDonations: 12, lastDonated: "2 months ago", isAvailable: true }
... (generate 12 with varied data, Bangladesh names and locations)

Skeleton state: show 9 SkeletonCard components for 1s then show real cards (useState + useEffect setTimeout)

Pagination at bottom (Pagination component, 10 per page mock)

─────────────────────────────────────
src/pages/guest/DonorProfile.jsx — Public Profile
─────────────────────────────────────
Back link ← "Find Donors" at top

Desktop: grid-cols-3 gap-8 max-w-6xl mx-auto:

LEFT SIDEBAR (col-span-1):
Card (border rounded-md p-6):
- Avatar: size-24 rounded-full mx-auto, colored initials
- BloodGroupBadge size=lg centered mt-4
- Name h2 font-bold + Location text-gray-500
- Available status badge (green pill "Available to Donate" or gray)
- Stats: 3 cards (Total Donations | Lives Saved | Member Since)
- "Request This Donor" Button primary fullWidth mt-6
- "Report Profile" text-xs text-gray-400 link mt-3 centered

RIGHT (col-span-2):
3 tabs: Overview | Donation History | Badges
Tab bar: border-b, active=red border-b-2 text-red-600

Tab 1 — Overview:
  About text (2 paragraphs)
  Info grid: Blood Group | Age | Division | Total Donations | Languages
  "Donation Facts" card

Tab 2 — Donation History:
  Timeline list (5 items): date-circle + Hospital Name + Blood Group badge + Status badge
  Each: flex gap-4, circle=bg-red-100 size-10, content=name+date+status

Tab 3 — Badges:
  Grid grid-cols-3 gap-4:
  6 badge cards (rounded-md p-4 text-center border):
  Earned: colored icon + name; Locked: opacity-50 gray + lock icon
  Names: First Drop | 5 Lives | 10 Lives | Community Hero | Platinum | Super Donor

─────────────────────────────────────
src/pages/guest/About.jsx
─────────────────────────────────────
1. Hero: title "About BloodConnect" + subtitle
2. Mission/Vision: 2 cards side by side (Target icon / Eye icon)
3. Impact: 4 stat inline
4. Team: 4 cards (size-20 avatar circle + name + role + bio 2 lines)
5. Timeline: vertical list with red dot + year + milestone (5 milestones 2019–2025)
6. CTA: "Join Our Mission" + "Contact Us" buttons

─────────────────────────────────────
src/pages/guest/Contact.jsx
─────────────────────────────────────
Grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto

Left — Contact Info cards (4 cards each with icon + title + value):
- MapPin + "Visit Us" + Dhaka address
- Phone + "Call Us" + 01700-000000
- Mail + "Email Us" + info@bloodconnect.org
- Clock + "Response Time" + "Within 24 hours"
Social links row at bottom

Right — Contact Form card (border rounded-md p-6 bg-white dark:bg-gray-800):
H3 "Send us a message"
- Input Name
- Input Email
- Select Subject (General Inquiry / Partnership / Report Issue / Emergency / Other)
- Textarea Message (rows=5, border rounded-md p-3 w-full)
- Button primary fullWidth "Send Message"
Loading state → success state (CheckCircle + "Thank you! We'll respond within 24 hours.")
Validation on submit

─────────────────────────────────────
src/pages/guest/Blog.jsx
─────────────────────────────────────
Page header + search bar

Category pills (flex flex-wrap gap-2 mb-8):
All | Stories | News | Tips & Health | Research | FAQ
Active: bg-red-600 text-white; Inactive: border text-gray-600
useState: selectedCategory

Grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6:
9 blog cards (flex flex-col h-full border rounded-md overflow-hidden):
- Image placeholder: h-48 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-gray-800 (category icon centered)
- Body p-5:
  Category badge + date text-xs text-gray-400
  Title: 2-line clamp font-semibold mt-2
  Excerpt: 3-line clamp text-sm text-gray-600 mt-2
  Footer (mt-auto pt-4 border-t flex justify-between):
    Author avatar (size-6 rounded-full) + author name + read time
    "Read More" text-red-600 text-sm flex items-center ArrowRight icon

─────────────────────────────────────
src/pages/guest/BlogPost.jsx
─────────────────────────────────────
Breadcrumb: Home > Blog > Post title
Max-w-3xl mx-auto:
Image placeholder (h-72 w-full rounded-md bg-red-gradient)
Category badge + Date + Read time
H1 title (text-3xl font-bold)
Author row: avatar + name + role + date
Article (prose-style): 4–5 paragraphs + h2 headings + blockquote (border-l-4 border-red-600 pl-4 italic)
Share row: "Share this article" + 3 social icon buttons

Related Articles: h3 + 3 compact blog cards in a row

─────────────────────────────────────
src/pages/guest/FAQ.jsx
─────────────────────────────────────
Page header + search Input (filters FAQ list via useState)
4 category tabs: About Donation | Eligibility | Process | Safety

For each category: h3 heading + 5 accordion items (same as Home.jsx FAQ section pattern)
20 total FAQ items across 4 categories

─────────────────────────────────────
src/pages/guest/Eligibility.jsx
─────────────────────────────────────
Grid grid-cols-1 lg:grid-cols-2 gap-12:

Left:
"Basic Requirements" (h3) + 6 items with CheckCircle (green) icons
"Temporary Disqualifications" (h3 mt-6) + 4 items with AlertTriangle (amber) icons
"Permanent Disqualifications" (h3 mt-6) + 3 items with XCircle (red) icons

Right:
"Blood Types & Compatibility" card (border rounded-md p-6)
8 blood group rows: BloodGroupBadge + compatibility text
+ "Why It Matters" info box (blue tint)

CTA section below: "Ready to donate? Register Today" Button primary

─────────────────────────────────────
src/pages/guest/WhyDonate.jsx
─────────────────────────────────────
5 sections:
1. Hero text section
2. "The Critical Need" — stats + para (bg-red-50 dark:bg-red-950 rounded-md p-8)
3. "Benefits for You" — 4 health benefit cards
4. "Blood Facts" — grid 4×2 of interesting fact cards (colored backgrounds)
5. CTA

─────────────────────────────────────
src/pages/guest/TrackRequest.jsx
─────────────────────────────────────
Min-h-screen centered:
Card max-w-lg:
- H2 "Track Your Blood Request"
- Input (Search icon) + Button primary "Track"
- Helper text

After submit (useState showResult):
Result card (border rounded-md p-6 mt-6):
- Request ID badge + Blood Group badge
- Patient name + Hospital + Date
- Status badge (large)
- 4-step progress timeline (horizontal desktop, vertical mobile):
  Submitted → Under Review → Matched → Fulfilled
  Each step: circle (filled=past, ring=current, gray=future) + label below
- If "matched": Assigned Donor card with "Chat" button

STRICT DESIGN RULES:
- rounded-md ONLY, NO rounded-xl
- Dark mode everywhere
- All cards same height using h-full
- Bangladesh realistic content
