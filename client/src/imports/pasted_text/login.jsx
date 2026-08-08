Build Login.jsx and Register.jsx.
Project: React 18 + Vite, TailwindCSS v4, lucide-react, react-router-dom v6.

─────────────────────────────────────
src/pages/auth/Login.jsx
─────────────────────────────────────
Full screen page: min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4

Card: w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-8

1. Back link: top-left, ArrowLeft icon + "Back to Home" → /

2. Logo + Title:
   Heart icon (red, size-10, fill) + "BloodConnect" h2 + "Login to your account" text-gray-500

3. Role Selector (useState: selectedRole = 'donor'):
   Grid grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-md
   4 buttons:
   - donor: Heart icon + "Donor"
   - admin: Shield icon + "Admin"
   - hospital: Building2 icon + "Hospital"
   - seeker: User icon + "Seeker"
   Active: bg-white dark:bg-gray-600 text-red-600 shadow-sm rounded-md
   Inactive: text-gray-500 hover:text-gray-700 rounded-md

4. Demo Credentials banner (conditional, shows when role selected):
   bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md p-3 mt-4
   Row: Key icon + "Demo credentials available" text-sm
   Demo email text-xs text-amber-700 + "Use Demo Account" button (small, amber border) onClick:
     Sets email + password state from DEMO_CREDENTIALS[selectedRole]

5. Form (onSubmit: sets isLoading=true for 1.5s then fake success):
   Input label="Email Address" type="email" leftIcon=Mail
   Input label="Password" type=password leftIcon=Lock rightIcon=Eye (toggle show/hide)
   Row: "Forgot password?" link right-aligned

6. Submit button: Button primary fullWidth loading={isLoading} "Login"

7. Divider: flex items-center gap-4 — line + "OR" + line

8. Social buttons (full width each, stacked):
   Google: border rounded-md py-2.5 flex items-center justify-center gap-3 hover:bg-gray-50
     SVG Google G (inline colored SVG) + "Continue with Google"
   Facebook: bg-blue-600 text-white rounded-md py-2.5 flex justify-center gap-3 hover:bg-blue-700
     f letter bold + "Continue with Facebook"

9. Footer: "Don't have an account?" + Link "Register here" text-red-600 → /register

Validation (onSubmit): empty fields → show error below each input, email format check.

─────────────────────────────────────
src/pages/auth/Register.jsx
─────────────────────────────────────
Full screen, same bg as Login.
Card: max-w-2xl w-full (wider for form steps)

STATE:
- currentStep: 1 (1–4)
- selectedRole: null
- formData: object with all fields

PROGRESS BAR (top of card):
4 steps connected by line (grid-cols-4 relative):
Step circles (size-9 rounded-full):
- Completed: bg-green-500 text-white (CheckCircle icon)
- Current: bg-red-600 text-white (step number)
- Future: border-2 border-gray-300 text-gray-400 (step number)
Step labels below: text-xs (Role | Personal Info | Health Info | Credentials)
Connecting line: absolute h-0.5 top-4 left-1/2 right-0 bg-gray-200 (gray for future, red for done)

─── STEP 1 — Choose Role ───
H3 "I want to..." centered, subtitle

3 large role cards (grid-cols-1 sm:grid-cols-3 gap-4):
Each card: border-2 rounded-md p-6 cursor-pointer text-center hover:border-red-300 transition-all
  Selected: border-red-600 bg-red-50 dark:bg-red-950/30 (CheckCircle top-right corner, green)
  Unselected: border-gray-200

1. Heart icon (size-12 text-red-500 mx-auto) — "Donor" h3 — "I want to donate blood"
2. Droplet icon (size-12 text-blue-500) — "Seeker" h3 — "I need blood for a patient"
3. Building2 icon (size-12 text-green-500) — "Hospital" h3 — "I represent a hospital"

─── STEP 2 — Personal Info ───
Grid grid-cols-1 sm:grid-cols-2 gap-4:
- Full Name (col-span-2)
- Date of Birth (type=date)
- Gender: 3 pill radio buttons (Male / Female / Other) — flex gap-3
  Each: px-4 py-2 border rounded-md cursor-pointer, selected=red
- Phone (+880 prefix, type=tel)
- Division: Select with BANGLADESH_DIVISIONS options
- District: Input type=text
- Address: textarea col-span-2 (border rounded-md p-3 resize-none)

─── STEP 3 — Health / Role Info ───

If role = donor or seeker:
- Blood Group: grid-cols-4 gap-2 of 8 pill buttons (BLOOD_GROUPS)
  Each: border rounded-md py-2 text-center text-sm font-bold cursor-pointer
  Selected: bg-red-600 text-white border-red-600
- Weight (kg): Input type=number
- Last Donation Date: Input type=date (optional, label says "Optional")
- Medical Conditions: textarea (optional, label says "e.g. diabetes, hypertension")

If role = hospital:
- Hospital Name: Input
- Registration/License No: Input
- Hospital Type: Select (Government / Private / NGO / Clinic)
- Total Beds: Input type=number

─── STEP 4 — Credentials ───
- Email: Input type=email
- Password: Input type=password with strength indicator below:
  4-segment bar: fills red as strength increases (weak/fair/good/strong)
  Criteria: 8+ chars, uppercase, number, special char
- Confirm Password: Input type=password
- Profile photo: file input styled as dashed border area (Upload icon + "Click to upload photo")
  On select: show image preview in circle (size-20 rounded-full)
- Terms checkbox: "I agree to Terms of Service and Privacy Policy"
- "Create Account" Button primary fullWidth loading state

NAVIGATION:
Bottom row:
- Step > 1: "Back" Button outline
- Step < 4: "Continue" Button primary + ArrowRight icon
- Step 4: "Create Account" Button primary + loading

Success state (after step 4 submit, show instead of form):
Green card: CheckCircle icon (size-16 green) + "Account Created!" + "Login here" link

STRICT DESIGN RULES:
- rounded-md ONLY everywhere — inputs, cards, buttons, selects
- No library components
- Dark mode on all elements
- Inter font
