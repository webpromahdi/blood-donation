---
name: Verify & Sync Donor Module
description: Compare the legacy donor module (vanilla JS/PHP) with the current React implementation. Identify every missing piece of logic, API call, or dynamic render — then immediately write the actual code to fix it.
---

## BEFORE ANYTHING ELSE — Read AGENTS.md

**First, read `c:\xampp\htdocs\blood-donation\AGENTS.md` completely.**

This file contains the full project architecture, API conventions, DB setup, coding rules, and known gotchas for this codebase. It was set up via `/init` and reflects the ground truth of how this project works. Do not skip this step — everything you do must follow the rules defined there.

---

You are working on the **BloodConnect** project. Your task is to audit and sync the **Donor** module.

**Your job is NOT just to report problems. For every problem you find, you MUST write the actual code fix immediately — edit the file, write the JSX, write the PHP, update the API call. Do not stop at listing issues.**


## Project Structure

- **Legacy codebase** (old frontend): `C:\Users\user\OneDrive\Desktop\blood-donation-main`
  - Old donor pages: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\pages\donor\`
  - Old shared JS scripts: `C:\Users\user\OneDrive\Desktop\blood-donation-main\src\scripts\`

- **Current React app**: `c:\xampp\htdocs\blood-donation\client\src\pages\donor\`
- **Current PHP API**: `c:\xampp\htdocs\blood-donation\api\donor\`

## Step-by-Step Instructions

Work through each page **one at a time**. For each page: read legacy → compare React → fix immediately → then move to next.

---

### For each donor page:

Pages (legacy → current):
- `dashboard.html` → `Dashboard.jsx`
- `health.html`    → `Health.jsx`
- `history.html`   → `History.jsx`
- `voluntary.html` → `Voluntary.jsx`
- `certificates.html` → `Certificates.jsx`
- `chat.html`      → `Chat.jsx`
- `profile.html`   → `Profile.jsx`

#### 1. Read the legacy HTML file

Extract and note:
- Every `fetch()` call: URL, method (GET/POST), request body shape, response fields used
- Every piece of data rendered dynamically in the DOM (ids, names, dates, status badges, etc.)
- All business rules: eligibility checks, status transitions, cooldown logic, form validations

#### 2. Read the current React `.jsx` file

Compare against legacy and identify gaps:
- Which API endpoints are missing or calling wrong URLs?
- Which response fields are not rendered in the JSX?
- Which business rules are not implemented?
- Are there `window.confirm`, `alert`, `setTimeout` mocks, or commented-out API calls?

#### 3. Fix everything found — write actual code now

**Do not describe what needs to be done. Write the code directly.**

- Add missing `api.get/post/put/delete` calls (never raw `fetch`)
- Write the JSX to render missing dynamic data
- Implement missing business logic in the component
- Replace `window.confirm` → `Modal` component
- Replace `alert` → `toast(message, { type, title })`
- Replace `setTimeout` mocks → real `api.post/get` calls

#### 4. Check the PHP API endpoint

For each API path the page calls, verify the PHP file exists in `api/donor/`:
- If **missing**: create the file immediately with proper structure:
  - `require_once __DIR__ . '/../../config/cors.php'`
  - `session_start()`
  - `require_once __DIR__ . '/../../config/database.php'`
  - `require_once __DIR__ . '/../../middleware/auth.php'`
  - `requireAuth(['donor'])` + `requireApprovedStatus()` where needed
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

**General:**
- Do NOT refactor working code — only add/fix what is broken or missing
- Do NOT over-engineer — match the legacy behavior, nothing more
- Do NOT touch: `client/src/imports/`, `client/dist/`, `node_modules/`

---

## Final Summary

After fixing all pages, output:

```
DONOR MODULE AUDIT — DONE
=========================
Dashboard.jsx    — OK | FIXED: <describe exactly what code was added/changed>
Health.jsx       — OK | FIXED: <describe exactly what code was added/changed>
History.jsx      — OK | FIXED: <describe exactly what code was added/changed>
Voluntary.jsx    — OK | FIXED: <describe exactly what code was added/changed>
Certificates.jsx — OK | FIXED: <describe exactly what code was added/changed>
Chat.jsx         — OK | FIXED: <describe exactly what code was added/changed>
Profile.jsx      — OK | FIXED: <describe exactly what code was added/changed>

PHP Endpoints:
/donor/...       — EXISTS-OK | CREATED | FIXED: <what changed>
```
