Build the complete BloodConnect Home page. File: src/pages/guest/Home.jsx
Imports: PublicNavbar, PublicFooter, BloodGroupBadge, Button from their respective paths.
Use react-router-dom Link for navigation. Lucide-react for icons.

Page = <PublicNavbar currentPage="home" /> + 11 sections + <PublicFooter />

─── SECTION 1: HERO ───
Min-height: 75vh. bg: white with radial gradient light red top-right.
Desktop: flex flex-row-reverse items-center gap-16 max-w-7xl mx-auto px-6

RIGHT (image side): w-1/2
- div with aspect-video bg-gradient-to-br from-red-100 to-red-50 rounded-md
- Inside: large blood drop SVG shape (CSS-only red gradient blob)
- 3 floating stat pills absolutely positioned on the image div:
  Each: bg-white rounded-md shadow-md px-3 py-2 text-sm flex items-center gap-2
  - "50K+ Donors" (Users icon, red)
  - "100K+ Lives" (Heart icon, pink)
  - "200+ Hospitals" (Building2 icon, blue)

LEFT (text side): w-1/2
- Pill badge: bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded-md text-sm inline-flex items-center gap-2
  "🩸 Every 2 Seconds Someone Needs Blood"
- H1: text-5xl font-bold text-gray-900 dark:text-white mt-4 leading-tight
  "Donate Blood,\nSave Lives"
- <p>: text-lg text-gray-600 mt-4 max-w-lg
  "Join 50,000+ donors across Bangladesh. Your single donation can save up to 3 lives. Register today and make a difference."
- Buttons row: gap-4 mt-8
  "Become a Donor" (Button primary lg) → /register
  "Request Blood" (Button outline lg) → /seeker/request
- Stats row: mt-10 pt-8 border-t flex gap-10
  3 stats: "50,000+" / "100,000+" / "24/7"
  Each: number (text-2xl font-bold text-red-600) + label (text-sm text-gray-500)

Mobile: flex-col, image first (h-48 w-full), then text

─── SECTION 2: WHY DONATE ───
py-20 bg-white dark:bg-gray-900
Centered: h2 "Why Donate Blood?" + p subtitle

Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12
4 cards (flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md hover:border-red-200 transition-all):
1. Heart icon (red-100 bg, size-10) — "Save Lives" — "One donation can save up to 3 patients in need"
2. Users icon (blue-100) — "Help Community" — "Support patients in Dhaka, Chittagong, and beyond"
3. Award icon (green-100) — "Health Benefits" — "Regular donation reduces iron overload and lowers cancer risk"
4. Clock icon (orange-100) — "Quick Process" — "The entire donation takes just 30–45 minutes of your time"

─── SECTION 3: HOW IT WORKS ───
py-20 bg-gray-50 dark:bg-gray-800/50
H2 "How It Works" + subtitle

Desktop: flex flex-row gap-0 relative with horizontal dashed red line connecting steps
3 steps (each w-1/3 text-center):
Step circle: size-14 rounded-full bg-red-600 text-white text-xl font-bold flex items-center justify-center mx-auto
Icon below circle (size-8 red-600 mt-4)
Title: text-lg font-semibold mt-3
Desc: text-sm text-gray-600 mt-2

Steps:
1 — UserPlus icon — "Register as Donor" — "Create your profile with blood group and health details"
2 — Search icon — "Get Matched" — "Our system matches you with urgent blood requests nearby"
3 — Heart icon — "Save a Life" — "Visit the hospital and make your life-saving donation"

Mobile: flex-col, each step left-aligned with red numbered dot

─── SECTION 4: BLOOD AVAILABILITY ───
py-20 bg-white dark:bg-gray-900
H2 "Blood Group Availability" + subtitle

Grid: grid-cols-2 md:grid-cols-4 gap-4 mt-10

8 cards for each blood group (import BLOOD_GROUPS from constants):
Card (border rounded-md p-5 text-center hover:shadow-md):
- BloodGroupBadge size=lg at top
- "X donors" text-2xl font-bold mt-2
- "available" text-sm text-gray-500
- Progress bar: w-full bg-gray-200 rounded-full h-2 mt-3
  Fill color matches blood group color

Mock data:
A+=1240 donors, A-=380, B+=980, B-=210, AB+=420, AB-=95, O+=1580, O-=290

─── SECTION 5: IMPACT COUNTER ───
py-20 bg-gradient-to-r from-red-600 to-red-800 text-white

4 stats (grid-cols-2 md:grid-cols-4):
Each: number (text-5xl font-bold count-up class) + label (text-lg mt-2 text-red-100)
- 50,000+ Donors Registered
- 100,000+ Lives Saved
- 200+ Hospital Partners
- 24/7 Emergency Support

useEffect + IntersectionObserver to trigger count-up animation when section in view.

─── SECTION 6: TESTIMONIALS ───
py-20 bg-gray-50 dark:bg-gray-800/50
H2 "What Donors Say" + subtitle

Desktop: grid-cols-3, Mobile: horizontal scroll (flex overflow-x-auto gap-4 snap-x)
3 cards (border rounded-md p-6 bg-white dark:bg-gray-800):
- Large " " gray quote mark text-6xl font-serif text-gray-200 -mt-2
- Quote text: italic text-gray-700 dark:text-gray-300
- Stars row: 5 filled Star icons text-yellow-400 mt-4
- Divider mt-4
- Avatar circle (size-10 rounded-full colored initials) + Name (font-semibold) + Role (text-sm text-gray-500)

Mock data:
1. "Donating blood is the easiest thing I've ever done to save a life..." — Karim Hossain, Regular Donor, Dhaka
2. "I needed O- blood urgently. BloodConnect found a donor in 2 hours..." — Fatema Begum, Blood Recipient, Chittagong
3. "As a hospital, BloodConnect has transformed how we manage blood supply..." — Dr. Rahman, CMO, Dhaka Medical

─── SECTION 7: HOSPITAL PARTNERS ───
py-16 bg-white dark:bg-gray-900
H2 centered + "200+ hospitals across Bangladesh trust our platform"

Grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10:
6 boxes (border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center hover:border-red-300):
- Building2 icon text-gray-400 mx-auto
- Hospital name text-sm font-medium text-gray-600 mt-2
Names: "Dhaka Medical College" "BSMMU Hospital" "Square Hospital" "Chittagong Medical" "Rajshahi Medical" "Sylhet MAG"

─── SECTION 8: ELIGIBILITY QUICK CHECK ───
py-20 bg-gray-50 dark:bg-gray-800/50
Grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto

Left:
H2 "Are You Eligible?" + subtitle
List of 4 requirements (each: check/alert icon + text):
✅ Age between 18–60 years
✅ Weight at least 50 kg
✅ Healthy with no chronic illness
⚠️ No donations in the last 3 months
Button "Check Full Eligibility" → /eligibility

Right: card (bg-white dark:bg-gray-800 border rounded-md p-6)
H3 "Quick Check" + 2 inputs (Name, Blood Group select) + "Check Now" button
After submit: green success card "You appear eligible! Register to proceed."

─── SECTION 9: FAQ ACCORDION ───
py-20 bg-white dark:bg-gray-900
H2 centered + subtitle
max-w-3xl mx-auto mt-10

useState: openFaq (string|null)
5 FAQ items. Each:
- Button: w-full flex justify-between items-center py-4 border-b
  Q text font-medium text-left + ChevronDown (rotate-180 when open, transition-transform)
- Answer: <div> with smooth max-height transition (max-h-0 → max-h-48 overflow-hidden transition-all duration-300)
  Text text-gray-600 dark:text-gray-400 pb-4

FAQs:
1. "Is blood donation safe?" — "Yes, only sterile single-use equipment is used."
2. "How often can I donate?" — "Whole blood every 3 months, platelets every 2 weeks."
3. "Does it hurt?" — "A brief pinch during needle insertion. Most donors feel no pain."
4. "How long does it take?" — "Registration 10 min + donation 10–15 min = 30 min total."
5. "Who can receive my blood?" — "Based on compatibility. O- is universal donor."

"View All FAQs" Button outline → /faq

─── SECTION 10: TRACK REQUEST ───
py-16 bg-white dark:bg-gray-900
Centered max-w-2xl:
Div: bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-8
H2 "Track Your Blood Request" + subtitle
Flex form: Input (flex-1) placeholder="Request ID or Phone Number" + Button primary "Track"
Helper text: "Enter your request ID (e.g. BC2025-1234) or registered phone number"

─── SECTION 11: NEWSLETTER / CTA ───
py-20 bg-gray-900 dark:bg-slate-950 text-white
Centered max-w-2xl:
H2 "Join 50,000+ Blood Heroes Today"
<p>: "Get updates on urgent blood needs in your area and save lives."
Flex row: Email input (bg-gray-800 border-gray-700 text-white rounded-md flex-1) + "Subscribe" Button primary
Note text-xs text-gray-500: "No spam. Only life-saving updates."

STRICT DESIGN RULES:
- rounded-md ONLY. NEVER rounded-xl or rounded-2xl
- Dark mode on every element
- All imports use @/ alias
