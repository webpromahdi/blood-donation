---
name: Verify & Sync Admin Module
description: Compare the legacy admin module (vanilla JS/PHP) with the current React implementation. Identify every missing piece of logic, API call, or dynamic render — then immediately write the actual code to fix it.
---

## BEFORE ANYTHING ELSE — Read AGENTS.md

**First, read `c:\xampp\htdocs\blood-donation\AGENTS.md` completely.**

This file contains the full project architecture, API conventions, DB setup, coding rules, and known gotchas for this codebase. It was set up via `/init` and reflects the ground truth of how this project works. Do not skip this step — everything you do must follow the rules defined there.

---

You are working on the **BloodConnect** project. Your task is to audit and sync the **Admin** module.

**Your job is NOT just to report problems. For every problem you find, you MUST write the actual code fix immediately — edit the file, write the JSX, write the PHP, update the API call. Do not stop at listing issues.**


## Project Structure

- **Legacy codebase** (old frontend): `C:\Users\user\OneDrive\Desktop\blood-donation-main`
  - Old admin pages: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\pages\admin\`
  - Old shared JS scripts: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\scripts\`

- **Current React app**: `c:\xampp\htdocs\blood-donation\client\src\pages\admin\`
- **Current PHP API**: `c:\xampp\htdocs\blood-donation\api\admin\`

## Step-by-Step Instructions

Work through each page **one at a time**. For each page: read legacy → compare React → fix immediately → then move to next.

---

### For each admin page:

Pages (legacy → current):
- `dashboard.html`      → `Dashboard.jsx`
- `donors.html`         → `Donors.jsx`
- `hospitals.html`      → `Hospitals.jsx`
- `voluntary.html`      → `Voluntary.jsx`
- `blood-groups.html`   → `BloodGroups.jsx`
- `announcements.html`  → `Announcements.jsx`
- `reports.html`        → `Reports.jsx`
- `notifications.html`  → `Notifications.jsx`
- `chat.html`           → `Chat.jsx`
- *(no legacy page)*    → `Requests.jsx` — admin request management, calls `api/admin/requests.php`
- *(no legacy page)*    → `Profile.jsx`  — admin profile, calls `api/auth/me.php` or similar

#### 1. Read the legacy HTML file

Extract and note:
- Every `fetch()` call: URL, method (GET/POST/PUT/DELETE), request body shape, response fields used
- Every piece of data rendered dynamically in the DOM (tables, badges, stats counters, modals, etc.)
- All business rules: approval flows, donor/hospital status transitions, blood group management, report filters, announcement broadcasts
- All admin-specific actions: approve/reject donors, approve/reject hospitals, manage blood groups, generate reports, manage/approve blood requests
- **Note:** `Requests.jsx` and `Profile.jsx` have no legacy HTML counterpart. For these, compare against the current React file and the PHP API only — verify all API calls are correct and all response fields are rendered.

#### 2. Read the current React `.jsx` file

Compare against legacy and identify gaps:
- Which API endpoints are missing or calling wrong URLs?
- Which response fields are not rendered in the JSX?
- Which business rules / admin actions are not implemented?
- Are there `window.confirm`, `alert`, `setTimeout` mocks, or commented-out API calls?
- Are tables/lists paginated and filterable like the legacy version?

#### 3. Fix everything found — write actual code now

**Do not describe what needs to be done. Write the code directly.**

- Add missing `api.get/post/put/delete` calls (never raw `fetch`)
- Write the JSX to render missing dynamic data
- Implement missing business logic in the component
- Replace `window.confirm` → `Modal` component
- Replace `alert` → `toast(message, { type, title })`
- Replace `setTimeout` mocks → real `api.post/get` calls

#### 4. Check the PHP API endpoint

For each API path the page calls, verify the PHP file exists in `api/admin/`:
- If **missing**: create the file immediately with proper structure:
  - `require_once __DIR__ . '/../../config/cors.php'`
  - `session_start()`
  - `require_once __DIR__ . '/../../config/database.php'`
  - `require_once __DIR__ . '/../../middleware/auth.php'`
  - `requireAuth(['admin'])` — admin does NOT need `requireApprovedStatus()`
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
- Admin role guard: `requireAuth(['admin'])` — no approved status check needed

**General:**
- Do NOT refactor working code — only add/fix what is broken or missing
- Do NOT over-engineer — match the legacy behavior, nothing more
- Do NOT touch: `client/src/imports/`, `client/dist/`, `node_modules/`

---

## Final Summary

After fixing all pages, output:

```
ADMIN MODULE AUDIT — DONE
=========================
Dashboard.jsx    — OK | FIXED: <describe exactly what code was added/changed>
Donors.jsx       — OK | FIXED: <describe exactly what code was added/changed>
Hospitals.jsx    — OK | FIXED: <describe exactly what code was added/changed>
Voluntary.jsx    — OK | FIXED: <describe exactly what code was added/changed>
BloodGroups.jsx  — OK | FIXED: <describe exactly what code was added/changed>
Announcements.jsx— OK | FIXED: <describe exactly what code was added/changed>
Reports.jsx      — OK | FIXED: <describe exactly what code was added/changed>
Notifications.jsx— OK | FIXED: <describe exactly what code was added/changed>
Chat.jsx         — OK | FIXED: <describe exactly what code was added/changed>
Requests.jsx     — OK | FIXED: <describe exactly what code was added/changed>
Profile.jsx      — OK | FIXED: <describe exactly what code was added/changed>

PHP Endpoints:
/admin/...       — EXISTS-OK | CREATED | FIXED: <what changed>
```
