---
name: Verify & Sync Seeker Module
description: Compare the legacy seeker module (vanilla JS/PHP) with the current React implementation. Identify every missing piece of logic, API call, or dynamic render — then immediately write the actual code to fix it.
---

## BEFORE ANYTHING ELSE — Read AGENTS.md

**First, read `c:\xampp\htdocs\blood-donation\AGENTS.md` completely.**

This file contains the full project architecture, API conventions, DB setup, coding rules, and known gotchas for this codebase. It was set up via `/init` and reflects the ground truth of how this project works. Do not skip this step — everything you do must follow the rules defined there.

---

You are working on the **BloodConnect** project. Your task is to audit and sync the **Seeker** module.

**Your job is NOT just to report problems. For every problem you find, you MUST write the actual code fix immediately — edit the file, write the JSX, write the PHP, update the API call. Do not stop at listing issues.**


## Project Structure

- **Legacy codebase** (old frontend): `C:\Users\user\OneDrive\Desktop\blood-donation-main`
  - Old seeker pages: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\pages\seeker\`
  - Old shared JS scripts: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\scripts\`

- **Current React app**: `c:\xampp\htdocs\blood-donation\client\src\pages\seeker\`
- **Current PHP API**: `c:\xampp\htdocs\blood-donation\api\seeker\`

## Step-by-Step Instructions

Work through each page **one at a time**. For each page: read legacy → compare React → fix immediately → then move to next.

---

### For each seeker page:

Pages (legacy → current):
- `request.html`         → `Request.jsx`
- `request-details.html` → `RequestDetails.jsx`
- `tracking.html`        → `Tracking.jsx`
- `track-results.html`   → *(no dedicated React page — check if its logic is merged into `Tracking.jsx` or `RequestDetails.jsx`; if missing, implement it)*
- `notifications.html`   → `Notifications.jsx`
- `chat.html`            → `Chat.jsx`
- *(no legacy page)*     → `Profile.jsx` — seeker profile; verify it calls `api/seeker/profile.php` correctly

> **Important for `track-results.html`:** This legacy page shows donor tracking results after a search (donor name, blood type, location, contact). Read it carefully and verify its logic is fully covered somewhere in the React app. If not, add it to `Tracking.jsx` or create a new component as needed.

#### 1. Read the legacy HTML file

Extract and note:
- Every `fetch()` call: URL, method (GET/POST/PUT/DELETE), request body shape, response fields used
- Every piece of data rendered dynamically in the DOM (request status cards, donor matches, tracking timeline, urgency badges, etc.)
- All business rules:
  - Submitting a blood request (blood type, quantity, urgency level, required date, patient info, hospital)
  - Viewing request status and history
  - Real-time donor tracking: accepted → on the way → reached → completed
  - Cancelling an active request
  - Request detail view with donor info

#### 2. Read the current React `.jsx` file

Compare against legacy and identify gaps:
- Which API endpoints are missing or calling wrong URLs?
- Which response fields are not rendered in the JSX?
- Which seeker-specific business rules / actions are not implemented?
- Are there `window.confirm`, `alert`, `setTimeout` mocks, or commented-out API calls?
- Is the tracking page showing live donor status updates?
- Is `track-results.html` logic fully covered in the current React routing?

#### 3. Fix everything found — write actual code now

**Do not describe what needs to be done. Write the code directly.**

- Add missing `api.get/post/put/delete` calls (never raw `fetch`)
- Write the JSX to render missing dynamic data
- Implement missing business logic in the component
- Replace `window.confirm` → `Modal` component
- Replace `alert` → `toast(message, { type, title })`
- Replace `setTimeout` mocks → real `api.post/get` calls
- If `track-results.html` logic is missing, add a route or merge into `Tracking.jsx`

#### 4. Check the PHP API endpoint

For each API path the page calls, verify the PHP file exists in `api/seeker/`:
- If **missing**: create the file immediately with proper structure:
  - `require_once __DIR__ . '/../../config/cors.php'`
  - `session_start()`
  - `require_once __DIR__ . '/../../config/database.php'`
  - `require_once __DIR__ . '/../../middleware/auth.php'`
  - `requireAuth(['seeker'])` — seeker does NOT need `requireApprovedStatus()`
  - PDO prepared statements only
  - JSON response matching what React expects
- If **exists but wrong response shape**: fix the PHP to return what React needs

---

## Coding Conventions — Must Follow

**React / TypeScript:**
- Use `api.get/post/put/delete` from `src/utils/apiService.ts` — never raw `fetch`
- Toast: `toast(message, { type: 'success'|'error'|'warning'|'info', title?: string })`
- Use existing UI components: `Button`, `Input`, `Select`, `Badge`, `Modal`, `Table`, `Pagination`
- Leave file extensions as-is (`.jsx` stays `.jsx`)

**PHP:**
- Every endpoint: cors → session_start → database → auth (in that order)
- Never echo HTML before headers
- All SQL via PDO prepared statements
- Response always `json_encode(['success' => bool, 'message' => '...', ...data])`
- Seeker role guard: `requireAuth(['seeker'])` — no approved status check needed

**General:**
- Do NOT refactor working code — only add/fix what is broken or missing
- Do NOT over-engineer — match the legacy behavior, nothing more
- Do NOT touch: `client/src/imports/`, `client/dist/`, `node_modules/`

---

## Final Summary

After fixing all pages, output:

```
SEEKER MODULE AUDIT — DONE
===========================
Request.jsx        — OK | FIXED: <describe exactly what code was added/changed>
RequestDetails.jsx — OK | FIXED: <describe exactly what code was added/changed>
Tracking.jsx       — OK | FIXED: <describe exactly what code was added/changed>
track-results.html — MERGED INTO: <which file> | MISSING: <if not covered>
Notifications.jsx  — OK | FIXED: <describe exactly what code was added/changed>
Chat.jsx           — OK | FIXED: <describe exactly what code was added/changed>
Profile.jsx        — OK | FIXED: <describe exactly what code was added/changed>

PHP Endpoints:
/seeker/...        — EXISTS-OK | CREATED | FIXED: <what changed>
```
