# TalkFlow — Project Context & Handoff

## Source of truth

The GitHub repository is the source of truth for the **current code**. This file is the source of truth for **project requirements, decisions, history, workflow, and progress**.

If this file and the repository differ:

- Trust the repository for current implementation/code.
- Use this file for project intent, requirements, decisions, history, and workflow.

Do not restart completed setup just because older context describes it.

---

## 1. Project

**Name:** TalkFlow

TalkFlow is a small practice chat application assigned by the user's supervisor.

The user is building the application themselves and wants an AI mentor to guide them incrementally rather than generating the entire application at once.

The user previously provided design/reference images for the chat application. Screens are built one by one, outside-inward.

---

## 2. Tech stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS v4
- npm
- React Router
- shadcn/ui
- shadcn component library: **Base UI**
- shadcn preset: **Nova**

Important:

- This is a JavaScript project, NOT TypeScript.
- The project uses the `@/` import alias.
- Keep the existing shadcn/Tailwind setup.
- Use shadcn components wherever they are applicable instead of unnecessarily creating custom components.
- Installed shadcn components so far: Button, Input, Label, InputOTP (+ group/slot/separator), Avatar (+ Fallback/Badge/Group/GroupCount), Badge.

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- cors
- nodemon
- nodemailer (added for OTP email delivery)
- npm
- ES Modules (`"type": "module"`)

### Authentication — UPDATED (was phone-based, now email-based)

Authentication is intentionally simple, but the identifier and flow changed from the original design:

- No JWT.
- No heavy authentication/security architecture.
- No password authentication.
- **Login identifier is now email, not phone number.** The `phone` field was fully replaced by `email` across `User` model, `Otp` model, controllers, and both frontend forms.
- **Sign Up now includes OTP verification** (this is a change from the original requirement of "Sign Up has NO OTP" — see Section 19 for why and what changed).
- OTP is delivered via **real email (Gmail SMTP via nodemailer)**, not printed in the terminal. SMS was considered but rejected due to cost; Gmail SMTP is free.
- `localStorage` stores the logged-in user (still just `{ id, email, name }`, key `user`).
- A frontend `ProtectedRoute` protects `/chat`.

Do not introduce complex authentication unless the user explicitly requests it. Do not reintroduce phone-based auth.

---

## 3. Current folder structure

Root:

`D:\AKTI\TalkFlow`

Current directories:

- `talkflow-frontend`
- `talkflow-backend`

---

## 4. Frontend status

React + Vite frontend is created and working. Tailwind CSS v4 is configured. shadcn initialized with Base UI + Nova preset. The `@/` import alias is working.

Existing shadcn components include Button, Input, Label, OTP-related UI, Avatar (with Fallback/Badge), and Badge.

Do not replace the existing shadcn/Tailwind setup unnecessarily.

---

## 5. shadcn setup history

(Unchanged from original setup — see repository. shadcn init succeeded with Base UI + Nova preset, alias configured, JS not TS. Avatar and Badge components were added later via `npx shadcn@latest add avatar badge` during Chat UI work.)

---

## 6. Current frontend pages

- `SignIn.jsx`
- `SignUp.jsx`
- `Landing.jsx`
- `Chat.jsx` — now the real Chats list screen (see Section 20), no longer a placeholder.
- `ProtectedRoute.jsx`

Check the GitHub repository for the exact current file locations and implementation.

### Sign Up — UPDATED FLOW

Old flow (deprecated): Sign Up (no OTP) → redirect to Sign In → Sign In generates OTP → verify → Chat.

**New flow (current):**

1. User enters name + email.
2. User clicks Create Account.
3. Frontend POSTs to `/api/auth/signup`.
4. Backend checks whether the email already exists; rejects duplicates.
5. New user is created in MongoDB.
6. **Immediately after successful signup, frontend automatically calls `/api/auth/send-otp`** for the same email (no navigation away, no manual step).
7. UI switches in-place to an OTP entry screen (same component, `otpSent` state flag), matching the pattern already used in `SignIn.jsx`.
8. User receives OTP via **real email** and enters it.
9. Frontend calls `/api/auth/verify-otp`.
10. On success, user is stored in `localStorage` and the app navigates **directly to `/chat`** — no stop at `/signin`.

A "Resend OTP" option (wired to call `/api/auth/send-otp` again) exists on both the Sign Up OTP screen and the Sign In OTP screen. Resending relies on the backend already deleting old OTPs via `Otp.deleteMany({ email })` before creating a new one, so the old code stops working once a new one is requested.

The "Already have an account? Sign In" link remains visible on both the form phase and the OTP phase of Sign Up (this was an explicit user decision — not a bug).

### Sign In

Same flow as before, just `phone` → `email`:

1. User enters email.
2. Frontend calls `/api/auth/send-otp`.
3. Backend checks account exists, generates OTP, emails it.
4. User enters OTP, frontend calls `/api/auth/verify-otp`.
5. On success, user stored in localStorage, navigate to `/chat`.
6. "Resend OTP" is wired here too (same handler pattern as Sign Up).

### Landing

Unchanged. Checks localStorage: no user → `/signin` (replace), user exists → `/chat` (replace).

### Chat

No longer a placeholder — see Section 20 for what's built.

---

## 7. Routing status

Routes unchanged structurally:

- `/` → Landing
- `/signin` → Sign In
- `/signup` → Sign Up
- `/chat` → Protected Chat (Chats list screen)

**Decision:** No separate route for individual conversations yet (e.g. no `/chat/:id`). User explicitly chose to build the Chats list first and decide on conversation routing/structure later. This decision is still pending as of the last session — see Section 21.

---

## 8. Landing behavior

Unchanged — see repository. Behavior confirmed correct and preserved.

---

## 9. ProtectedRoute status

Unchanged and working. Still a frontend-only guard checking localStorage for `user`.

---

## 10. Authentication architecture — UPDATED

### Sign Up (current)

Name + email → create user in MongoDB → auto-send OTP → verify OTP → localStorage → **directly to Chat** (no Sign In detour).

### Sign In (current)

Email → check account exists → generate OTP → email OTP → verify → localStorage → Chat.

Overall:

Sign Up:
`Name + Email → MongoDB User → Auto OTP → Verify → Chat`

Sign In:
`Email → Existing User Check → OTP → Email Delivery → Verify → localStorage → Chat`

---

## 11. Backend status

Backend working on port `5000`. Frontend Vite dev server on `5173`. CORS configured. MongoDB connection working (local instance — see Section 22 for a resolved connection issue).

---

## 12. MongoDB status

Database: `talkflow`. Collections: `users`, `otps` (and soon `conversations`, `messages` — see Section 21).

The `users` collection was **manually dropped** during the phone→email migration to avoid unique-index conflicts from old phone-based documents with no `email` field. If old data is ever needed, it is gone — this was an explicit, accepted decision for a practice project.

---

## 13. User model — UPDATED (phone → email)

Current fields:

- `email` (String, required, unique, lowercase, trim)
- `name` (String, default "")
- timestamps

`phone` no longer exists on this model. Do not reintroduce it.

---

## 14. OTP model — UPDATED (phone → email)

Current fields:

- `email` (String, required, lowercase, trim) — not unique; uniqueness of "one active OTP" is enforced by deleting prior OTPs before creating a new one, not by a schema constraint.
- `otp` (String, required, 4 digits)
- `expiresAt` (Date, required, 5-minute expiry from creation)
- timestamps

Behavior unchanged: previous OTPs for the same email are deleted before a new one is created; used/expired OTPs are deleted after verification attempts.

---

## 15. API endpoints — UPDATED (phone → email)

| Method | Endpoint               | Purpose                                                                 |
| ------ | ---------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/auth/signup`     | Create account using name + email, then frontend auto-triggers send-otp |
| POST   | `/api/auth/send-otp`   | Generate OTP for an existing user, email it via Gmail SMTP              |
| POST   | `/api/auth/verify-otp` | Verify OTP and return user                                              |
| GET    | `/api/health`          | Check whether backend is running                                        |

All request bodies now use `email` instead of `phone`.

---

## 16. Sign Up API behavior — UPDATED

`POST /api/auth/signup`

Data: `name`, `email`

Behavior: validate → check duplicate email → reject if exists → create user → return created user's basic info. No OTP is generated server-side during signup itself — the frontend makes a **separate** `send-otp` call immediately after a successful signup response. This keeps `createUser` single-purpose; OTP generation logic lives only in `sendOtp`.

---

## 17. Send OTP API behavior — UPDATED

`POST /api/auth/send-otp`

Data: `email`

Behavior: validate → check user exists → reject unknown email → delete previous OTP(s) for that email → generate 4-digit OTP → store in MongoDB with 5-min expiry → **send via Gmail SMTP (nodemailer)** → also still `console.log`s the OTP as a debug fallback → return success.

If the email fails to send (SMTP error), the endpoint returns a `500` with `"Failed to send OTP email. Please try again."` — the OTP record still exists in the DB in this case, but the user has no way to receive it until a resend succeeds.

---

## 18. Verify OTP API behavior

Unchanged in logic, just `phone` → `email` throughout. See repository.

---

## 19. Why Sign Up now includes OTP (design change from original spec)

The original project context stated "Sign Up does NOT use OTP" and that Sign Up redirects to Sign In afterward. The user explicitly changed this because the extra Sign Up → Sign In → OTP hop was redundant. The new flow generates and verifies OTP immediately after signup and goes straight to Chat. **This supersedes the old requirement.** Do not revert to the old two-step flow.

---

## 20. Chat UI — IN PROGRESS (outside-inward build)

Design reference: 4-screen mockup (`TalkFlow.png`, uploaded to the project). Screens 1–2 (Sign In / Create Account with email+password fields) do **not** apply — this project's actual auth UI already differs (email + OTP, no password). Screens 3–4 (Chats list, individual Conversation) are the ones being built.

**Decision:** Build the Chats list first; decide on Conversation screen/routing structure later (see Section 21 for how this evolved once real-time messaging planning started).

**Decision:** Color theming (teal/orange from the design) is explicitly deferred. Current build uses the existing neutral shadcn theme only. Do not add teal/orange colors unless the user asks.

### What's built in `Chat.jsx` so far:

- Full-height flex-column page layout: header (shrink-0) + scrollable main list area (flex-1 overflow-y-auto).
- Header:
  - "TalkFlow" title (left).
  - Search icon (`lucide-react`, not yet wired to anything functional).
  - Logout icon (`lucide-react` `LogOut`) — **fully functional**: clears `user` from localStorage and navigates to `/signin`.
  - Plain gray circle placeholder for the user's own avatar (not yet a real Avatar component/image).
  - Tabs row: only **CHATS** is active/rendered. **GROUPS and CALLS tabs were commented out** per explicit user request — not needed yet. Do not re-add them without being asked.
- Chat list:
  - Rendered from a hardcoded local array (`chats`), not real backend data yet.
  - Uses shadcn `Avatar`/`AvatarFallback` (initials, no real images yet) and `Badge` (unread count) components.
  - Floating compose button (bottom-right), using `lucide-react`'s `SquarePen` icon — not yet wired to any action.
- No conversation/detail screen exists yet.
- No real chat data, no fetching from backend yet — the list is entirely static/hardcoded pending the Message/Conversation model work (Section 21).

---

## 21. Real-time messaging — PLANNING STAGE (not yet built)

This is the current active work area, started after the Chat UI visual skeleton was in place.

**Decisions made:**

- **1-on-1 chat only for now** — no group conversations. Do not build group logic unprompted.
- **Separate `Conversation` model + `Message` model** (not embedding messages directly with sender/receiver on a flat Message-only structure). This was chosen specifically so the schema can extend to group chats later without a rewrite.

**Agreed build order (from most recent planning):**

1. `Conversation` model — participants array (ref `User`), timestamps. **Code was provided to the user in the last session; not yet confirmed as implemented/tested.** Verify against the repository before assuming this exists.
2. `Message` model — references conversation, sender, content, timestamps. **Not yet started.**
3. Basic backend routes/controllers: create-or-get conversation, send message, fetch messages for a conversation, fetch a user's conversation list. **Not yet started.**
4. Real Conversation UI screen, replacing the still-undecided routing structure from Section 7. **Not yet started.**
5. Wire the Chats list to link into real conversations (replacing the hardcoded array). **Not yet started.**
6. Socket.IO — server setup, client connection, then live message events. **Not yet started.** (The user asked to jump straight to "sockets" before this plan existed; was redirected to build data model + UI first, which is the current in-progress path.)

**For the next session:** Start by verifying with the user (and inspecting the repo) whether `Conversation.js` was actually created, then continue with the `Message` model (step 2 above) if so, or step 1 if not.

---

## 22. Gmail SMTP setup (OTP email delivery) — NEW

Chosen over SMS specifically because Gmail SMTP is free and SMS providers charge per message.

Setup performed:

- User has a Gmail account with 2-Step Verification enabled and generated an **App Password** (16-character, not the account's normal password — Gmail blocks plain-password SMTP).
- Backend `.env` holds `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
- `nodemailer` installed as a backend dependency.
- New file: `talkflow-backend/src/utils/mailer.js`, exporting `sendOtpEmail(email, otp)`.
- Wired into `authController.js`'s `sendOtp` function — sends a plain-text email with the OTP; still also logs to terminal as a debug fallback (harmless to keep).

### Known gotcha already hit and resolved: ES module import-order bug

**Symptom:** `Error: Missing credentials for "PLAIN"` (`code: 'EAUTH'`) when sending OTP emails, even though `.env` had correct values.

**Root cause:** In ES modules, `import` statements are hoisted and resolved before any top-level code runs — including `dotenv.config()` in `server.js`. Since `mailer.js` originally created its nodemailer `transporter` at **module load time** (top-level, outside any function), it read `process.env.GMAIL_USER`/`GMAIL_APP_PASSWORD` before `dotenv.config()` had populated them, getting `undefined` for both.

**Fix applied:** Moved `nodemailer.createTransport(...)` **inside** the `sendOtpEmail` function body, so credentials are read at call-time (after `dotenv.config()` has definitely run), not at import-time. Do not move transporter creation back to module scope.

---

## 23. MongoDB local connection issue — resolved

Hit `connect ECONNREFUSED 127.0.0.1:27017` at one point. Root cause: the local MongoDB Windows service had stopped running (not a `.env`/connection-string problem). Fixed by restarting the MongoDB service. Unrelated VS Code crash (`reason: 'oom'`) happened around the same time but was a separate, unrelated editor issue — no code was lost.

---

## 24. shadcn usage preference

Unchanged. Use shadcn components where applicable (Avatar, Badge now added to the installed set). Don't install components that aren't needed yet.

---

## 25. Development workflow

Unchanged — one step at a time, user implements and tests, says "done" or gives feedback, then continues. Same rules: no large code dumps, no rebuilding working files without reason, no premature scope (e.g. don't build GROUPS/CALLS tabs, group chat, or conversation routing until asked).

---

## 26. Teaching style

Unchanged — direct, beginner-friendly where needed, "ruthless mentor" style, no unnecessary sugarcoating. Note: user has also explicitly asked at times to "stop focusing on styling/colors and work on logic" — prioritize functional/logic steps over visual polish unless the user is actively in a styling step.

---

## 27. Important historical issues already resolved

(Original phone/shadcn/TypeScript/CORS/MongoDB issues unchanged — see prior version of this file / repository history.)

### New issues resolved this phase:

- **users collection unique-index conflict during migration** → resolved by manually dropping the `users` collection in MongoDB Compass before testing the email-based schema.
- **Gmail SMTP `EAUTH` / missing credentials** → resolved by moving transporter creation inside the function (see Section 22).
- **Local MongoDB ECONNREFUSED** → resolved by restarting the stopped MongoDB service (see Section 23).

---

## 28. Practical security limitations

Unchanged — still a practice project, not production auth. Additional note: OTPs are now delivered via a personal Gmail account's SMTP relay, which is fine for practice/small-scale use but is not how a production app would send transactional email (a dedicated transactional email service would be used instead). No need to change this unless the user asks.

---

## 29. Future features — not yet implemented

Updated list (real-time messaging items are now actively being planned/built, not just "future"):

- **Message/Conversation models and real messaging — IN PROGRESS, see Section 21.**
- **Socket.IO / real-time delivery — planned next after models + basic REST messaging work, see Section 21.**
- Logout — **DONE** (see Section 20), remove from "future" list.
- Real SMS OTP service — **superseded**; Gmail SMTP email OTP was chosen instead and is done. Do not build SMS.
- OTP resend — **DONE** (see Section 6).
- Online/offline status
- Typing indicator
- Read receipts
- Image/file messages
- Search (search icon exists in header UI but is not wired to anything yet)
- Profile/settings
- Responsive/mobile chat UI
- Group chats — explicitly deferred, not in current scope (see Section 21 decision)
- Production authentication
- Deployment

Do not start unlisted future items prematurely.

---

## 30. Logout — DONE

Implemented in `Chat.jsx` header: clicking the `LogOut` icon clears `user` from localStorage and navigates to `/signin`. This section is now historical/complete, kept for reference.

---

## 31. End-to-end user journeys — UPDATED

### New user

`/` → Landing → no localStorage user → `/signin` → `/signup` → enter name + email → Create Account → MongoDB user created → **OTP auto-sent via email** → user enters OTP → verified → localStorage → **`/chat` directly** (no Sign In stop).

### Existing logged-in user

`/` → Landing → user exists in localStorage → `/chat`.

### Sign In

`/signin` → email → Send OTP → backend checks account → generates OTP → **emails it via Gmail SMTP** → user enters OTP (or uses Resend OTP if needed) → Verify → user returned → localStorage → `/chat`.

### Direct Chat access

`/chat` → ProtectedRoute → no user → `/signin` → user exists → Chat (Chats list screen).

### Logout

Chat header → click logout icon → localStorage cleared → `/signin`.

---

## 32. User's explicit project decisions — UPDATED

Superseded/changed items are marked; new items appended.

1. Use npm.
2. React + Vite frontend.
3. JavaScript, not TypeScript.
4. Tailwind CSS v4.
5. shadcn/ui.
6. shadcn Base UI.
7. shadcn Nova preset.
8. Node + Express backend.
9. MongoDB.
10. Mongoose.
11. Simple authentication.
12. No JWT.
13. No heavy security/auth architecture.
14. ~~Sign Up has no OTP.~~ **SUPERSEDED: Sign Up now auto-triggers OTP and verifies before reaching Chat.**
15. ~~Sign Up requires name + phone.~~ **SUPERSEDED: Sign Up requires name + email.**
16. ~~Sign In requires phone + 4-digit OTP.~~ **SUPERSEDED: Sign In requires email + 4-digit OTP.**
17. ~~OTP is currently printed in the backend terminal.~~ **SUPERSEDED: OTP is emailed via Gmail SMTP (nodemailer); terminal log kept only as a debug fallback.**
18. Successful login stores user in localStorage.
19. `/chat` is protected by ProtectedRoute.
20. `/` renders Landing and decides between `/signin` and `/chat`.
21. Build UI one screen at a time.
22. User writes/builds the code themselves.
23. Use shadcn where applicable.
24. Do not unnecessarily create custom components when shadcn already provides a suitable one.
25. Build UI from the outside inward.
26. Keep solutions simple unless the user explicitly requests a more advanced approach.
27. **NEW: "Already have an account? Sign In" link stays visible on both the signup form and OTP phases of Sign Up.**
28. **NEW: Resend OTP is implemented identically on both Sign Up and Sign In OTP screens.**
29. **NEW: GROUPS and CALLS tabs in the Chat header are commented out / not built — CHATS only for now.**
30. **NEW: Color theming (teal/orange from design) is deferred; build with the existing neutral shadcn theme for now.**
31. **NEW: No separate route for individual conversations yet — Chats list built first, conversation routing/screen decided later (in progress, see Section 21).**
32. **NEW: 1-on-1 chat only, no groups, for the real-time messaging feature.**
33. **NEW: Messaging uses a separate Conversation model (participants array) + Message model, not a flat sender/receiver-only Message model.**
34. **NEW: When user asks to "stop focusing on styling, work on logic," prioritize functional steps until told otherwise.**

---

## 33. Handoff instructions for a new AI

### First

Read this file completely.

### Second

Inspect the GitHub repository's current source code. Do not assume historical code descriptions (including from the original version of this file) are identical to the current implementation — this file has been updated once already to reflect a phone→email migration, an OTP flow change, and Chat UI progress, but the repository is still the final source of truth.

### Third

Understand the current state:

- Frontend and backend working.
- MongoDB working (local instance; `users` collection was deliberately dropped once during migration).
- Auth is now **email + OTP** for both Sign Up and Sign In, with Sign Up going straight through OTP verification to `/chat` (no Sign In detour).
- OTP delivery is via **real email (Gmail SMTP / nodemailer)**, not SMS, not terminal-only (though terminal logging remains as a debug fallback).
- Chat UI: Chats list screen is built (header with working logout, hardcoded chat list using shadcn Avatar/Badge, floating compose button) — GROUPS/CALLS tabs intentionally excluded, colors intentionally deferred.
- Real-time messaging is **in planning/early build**: Conversation model was drafted (verify if actually saved to the repo), Message model and everything after it is not yet built.

### Fourth

Do NOT:

- restart project creation or already-working setup
- reintroduce phone-based auth
- reintroduce the Sign Up → Sign In → OTP three-step flow
- switch back to terminal-only OTP or add SMS
- add TypeScript, JWT, or heavy auth architecture
- add GROUPS/CALLS tabs or group chat support without being asked
- add color theming without being asked
- move the nodemailer transporter back to module-level scope (reintroduces the EAUTH bug)

### Fifth

Continue with the real-time messaging plan in Section 21: verify whether `Conversation.js` exists in the repo, then proceed to the `Message` model, then basic REST routes for conversations/messages, then the Conversation UI screen, then wiring the Chats list to real data, then Socket.IO last.

---

## 34. Final current state

**Project:** TalkFlow

**Phase:** Auth fully migrated to email + Gmail SMTP OTP (complete). Chat UI (Chats list) visual/functional skeleton complete for its current scope. Real-time messaging (Conversation/Message models, REST routes, Conversation UI, Socket.IO) is the active in-progress phase.

**Latest completed work:**

- Signup flow changed to auto-OTP → direct-to-chat (no Sign In detour).
- Resend OTP added to both Sign Up and Sign In.
- Chat.jsx built: header (logo, search icon, working logout, avatar placeholder, CHATS-only tab), scrollable chat list (shadcn Avatar/Badge, hardcoded data), floating compose button.
- Full migration from phone-based to email-based identity across User model, Otp model, controllers, and both frontend forms.
- Gmail SMTP OTP delivery via nodemailer, including a resolved ES-module import-order bug (EAUTH).
- `users` collection dropped once during migration (accepted data loss for a practice project).
- Planning completed for real-time messaging: 1-on-1 only, separate Conversation + Message models. `Conversation` model code was provided to the user; **not yet confirmed implemented** — verify first in the next session.

**Next task:**
Verify/create the `Conversation` model, then build the `Message` model, then basic REST routes (create-or-get conversation, send message, fetch messages, fetch conversation list), then the Conversation UI screen, then wire the Chats list to real data, then add Socket.IO for live delivery.

**Most important rule:**
Do not restart setup. Inspect the GitHub repository and continue from the current code — this file's Section 21 "not yet confirmed" note on the Conversation model is the first thing to check.
