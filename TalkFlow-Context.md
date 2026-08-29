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

The user previously provided design/reference images for the chat application. The screens will be built one by one.

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

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- cors
- nodemon
- npm
- ES Modules (`"type": "module"`)

### Authentication

Authentication is intentionally simple.

Requirements:

- No JWT.
- No heavy authentication/security architecture.
- No password authentication.
- Sign Up does NOT use OTP.
- Sign In uses phone number + 4-digit OTP.
- OTP is currently printed in the backend terminal instead of being sent through a real SMS provider.
- `localStorage` stores the logged-in user.
- A frontend `ProtectedRoute` protects `/chat`.

Do not introduce complex authentication unless the user explicitly requests it.

---

## 3. Current folder structure

Root:

`D:\AKTI\TalkFlow`

Current directories:

- `talkflow-frontend`
- `talkflow-backend`

Current paths:

- `D:\AKTI\TalkFlow\talkflow-frontend`
- `D:\AKTI\TalkFlow\talkflow-backend`

---

## 4. Frontend status

React + Vite frontend is created and working.

Tailwind CSS v4 is configured.

shadcn was initialized successfully with:

- Component library: Base UI
- Preset: Nova

The `@/` import alias is working.

Existing important frontend areas include:

- `src/pages/`
- `src/components/`
- `src/components/ui/`
- `src/lib/`

Existing shadcn components include Button, Input, and OTP-related UI used by Sign In.

Do not replace the existing shadcn/Tailwind setup unnecessarily.

---

## 5. shadcn setup history

shadcn initially failed because a valid import alias was not configured.

The alias was then configured for the `src` directory.

A TypeScript `baseUrl` deprecation warning was encountered during setup, but shadcn initialization ultimately succeeded.

Final state:

- `npx shadcn@latest init` completed successfully.
- Components can be added with the shadcn CLI.
- The user wants shadcn used where it provides useful components.

Do not convert the project to TypeScript.

---

## 6. Current frontend pages

Important pages currently include:

- `SignIn.jsx`
- `SignUp.jsx`
- `Landing.jsx`
- `Chat.jsx`

Check the GitHub repository for the exact current file locations and implementation.

### Sign In

Sign In UI is built and connected to the backend.

Flow:

1. User enters phone number.
2. User requests OTP.
3. Backend checks whether the phone belongs to an existing user.
4. Backend generates a 4-digit OTP.
5. OTP is stored in MongoDB.
6. OTP is printed in the backend terminal as a temporary replacement for SMS.
7. User enters OTP.
8. Backend verifies OTP.
9. Successful verification returns the user.
10. Frontend stores the user in localStorage.
11. Frontend navigates to `/chat`.

### Sign Up

Sign Up UI is built and connected to the backend.

Flow:

1. User enters name.
2. User enters phone number.
3. User clicks Create Account.
4. Frontend sends the data to the backend.
5. Backend checks whether the phone already exists.
6. New user is created in MongoDB.
7. Backend returns the created user.
8. Frontend navigates to `/signin`.

**Important: Sign Up has NO OTP.**

### Landing

`Landing.jsx` has been created.

The `/` route renders Landing.

Landing checks localStorage:

- If no user exists → navigate with `replace` to `/signin`.
- If a user exists → navigate with `replace` to `/chat`.

Therefore `/` is the application's entry/decision route.

### Chat

`Chat.jsx` exists as a temporary/basic page used to confirm successful login.

The actual Chat UI based on the user's design/reference images has NOT yet been built.

---

## 7. Routing status

React Router is installed and working.

Conceptual routes:

- `/` → Landing
- `/signin` → Sign In
- `/signup` → Sign Up
- `/chat` → Protected Chat

`/chat` is wrapped in `ProtectedRoute`.

---

## 8. Landing behavior

Current intended entry flow:

Open `/`
→ Landing
→ check localStorage
→ no user → `/signin`
→ user exists → `/chat`

Navigation uses `replace`.

This behavior is complete and should be preserved.

---

## 9. ProtectedRoute status

ProtectedRoute has been completed.

Purpose:
Prevent a user without a logged-in user record in localStorage from directly accessing `/chat`.

Conceptual behavior:

`/chat`
→ ProtectedRoute
→ check localStorage
→ no user → `/signin`
→ user exists → render Chat

This is a simple frontend route guard suitable for this practice project.

It is NOT production-grade authentication. The project intentionally uses simple localStorage-based state.

---

## 10. Authentication architecture

### Sign Up

Sign Up:

- Name + phone
- No OTP
- Create user directly in MongoDB
- Redirect to Sign In

### Sign In

Sign In:

- Phone number
- Check whether account exists
- Generate 4-digit OTP
- Store OTP in MongoDB
- Print OTP in backend terminal
- User enters OTP
- Verify OTP
- Return user
- Store user in localStorage
- Navigate to Chat

Overall:

Sign Up:
`Name + Phone → MongoDB User → Sign In`

Sign In:
`Phone → Existing User Check → OTP → MongoDB OTP → Verify → localStorage → Chat`

---

## 11. Backend status

Backend is working successfully on port `5000`.

Frontend Vite development server normally runs on port `5173`.

Frontend and backend communicate through HTTP requests/fetch.

MongoDB connection is working.

---

## 12. MongoDB status

The user is new to MongoDB and had never used it before this project.

MongoDB is now successfully connected and working.

MongoDB Compass is installed and has been used to inspect documents.

Database:

`talkflow`

Main collections:

- `users`
- `otps`

Basic model:

MongoDB
→ Database
→ Collection
→ Document

TalkFlow:

`talkflow`
→ `users`
→ `otps`

The user has successfully seen OTP documents in MongoDB Compass.

When explaining MongoDB, keep explanations beginner-friendly and briefly explain what is happening.

---

## 13. User model requirements

User data includes at minimum:

- name
- phone
- timestamps

Phone number is unique.

Always inspect the repository for the exact current schema before changing it.

---

## 14. OTP model requirements

OTP data includes at minimum:

- phone
- OTP
- expiration time
- timestamps

Current intended behavior:

- OTP is 4 digits.
- OTP has a short expiration period, currently intended as 5 minutes.
- Previous OTPs for the same phone are removed/replaced.
- Successfully used OTPs are removed.
- OTP is printed in the backend terminal instead of being sent through SMS.

Inspect the repository for exact implementation before modifying it.

---

## 15. API endpoints

Current endpoints:

| Method | Endpoint               | Purpose                           |
| ------ | ---------------------- | --------------------------------- |
| POST   | `/api/auth/signup`     | Create account using name + phone |
| POST   | `/api/auth/send-otp`   | Generate OTP for an existing user |
| POST   | `/api/auth/verify-otp` | Verify OTP and return user        |
| GET    | `/api/health`          | Check whether backend is running  |

Local backend:

`http://localhost:5000`

Local frontend:

`http://localhost:5173`

---

## 16. Sign Up API behavior

`POST /api/auth/signup`

Data:

- name
- phone

Behavior:

1. Validate required fields.
2. Check if phone already exists.
3. Reject duplicate phone.
4. Create new user.
5. Return created user's basic information.

No OTP is involved.

The user has tested:

- Successful account creation.
- Duplicate phone rejection.
- User creation visible in MongoDB.

---

## 17. Send OTP API behavior

`POST /api/auth/send-otp`

Data:

- phone

Behavior:

1. Validate phone.
2. Check that the user exists.
3. Reject unknown phone.
4. Remove previous OTP for that phone.
5. Generate 4-digit OTP.
6. Store OTP in MongoDB.
7. Set expiration.
8. Print OTP in backend terminal.
9. Return success.

No real SMS provider is connected.

---

## 18. Verify OTP API behavior

`POST /api/auth/verify-otp`

Data:

- phone
- OTP

Behavior:

1. Validate phone and OTP.
2. Find matching OTP.
3. Reject invalid OTP.
4. Reject expired OTP.
5. Check that user exists.
6. Delete successfully used OTP.
7. Return basic user information.

Frontend then:

- Saves returned user in localStorage.
- Navigates to `/chat`.

---

## 19. CORS issue — resolved

There was a CORS error because frontend and backend run on different local ports.

Frontend:
`http://localhost:5173`

Backend:
`http://localhost:5000`

The issue was fixed using Express CORS middleware.

Do not repeat CORS setup unless the current repository shows it is missing/broken.

---

## 20. localStorage authentication

The logged-in user is stored in browser localStorage.

Key:

`user`

The stored value contains the returned user's basic information.

Current architecture intentionally does NOT use:

- JWT
- sessions
- cookies for auth
- refresh tokens
- OAuth
- global authentication context

Keep it simple unless the user changes the requirement.

---

## 21. Authentication completion status

Completed:

- React/Vite frontend
- Tailwind CSS
- shadcn setup
- Base UI library
- Nova preset
- Sign In UI
- Sign Up UI
- Sign In backend
- Sign Up backend
- MongoDB connection
- Mongoose models
- OTP generation
- OTP storage
- OTP verification
- OTP expiration handling
- Duplicate user handling
- CORS
- Frontend/backend integration
- localStorage login state
- Redirect to Chat after successful login
- ProtectedRoute
- Landing.jsx
- `/` entry routing logic

For the current practice-project scope, authentication is considered complete.

---

## 22. Current unfinished work

The major unfinished area is the **actual Chat UI**.

The user previously provided design/reference images.

The goal is to build the Chat screen based on those designs.

The existing Chat page is currently only a temporary authentication-success page.

Next major task:

**Start building the actual TalkFlow Chat screen from the provided design/reference images.**

---

## 23. Chat UI strategy

The user wants to build screens one by one.

Do NOT dump the entire Chat UI into one response.

Use this process:

1. Analyze the design.
2. Build the outer page/container.
3. Build the main layout.
4. Build major sections/columns.
5. Build individual components.
6. Add spacing and typography.
7. Add icons, avatars, buttons, inputs, etc.
8. Add responsive behavior.
9. Refine visual details.
10. Add interaction/state after the visual structure is correct.

The user calls this building **from the outside inward**:

`Page → Main layout → Major sections → Components → Elements → Fine details`

Use this approach.

Do not arbitrarily redesign the supplied design.

---

## 24. shadcn usage preference

The user specifically wants shadcn components where applicable.

Before creating a custom component, check whether shadcn has a suitable component.

Potential useful components include:

- Button
- Input
- Avatar
- Dropdown/Menu
- Dialog
- Tooltip
- Scroll Area
- Separator
- Tabs
- Sheet
- Input OTP
- etc.

Do not install every possible component. Add only what is useful.

---

## 25. Development workflow

The user wants to build the code themselves.

Preferred workflow:

1. Explain what is being built.
2. Give one manageable step.
3. Provide the code needed for that step.
4. User implements it.
5. User tests it.
6. User says `done`.
7. Move to the next step.

Do not:

- dump hundreds of lines unnecessarily
- rebuild working files without reason
- restart setup
- repeat completed work
- over-engineer
- add unnecessary dependencies
- introduce complex authentication

When the user says `done`, continue from the next logical step.

---

## 26. Teaching style

The user is learning React, Tailwind, shadcn, Express, and MongoDB.

They prefer:

- Direct explanations.
- Beginner-friendly explanations for unfamiliar concepts.
- Clear identification of mistakes.
- No unnecessary sugarcoating.
- Practical step-by-step guidance.

The user has requested a "ruthless mentor" style.

Be direct, but still explain why something is being done.

---

## 27. Important historical issues already resolved

### `/` black screen

Originally, only `/signin`, `/signup`, and `/chat` existed.

Opening `/` produced:

`No routes matched location "/"`

This was initially fixed with a redirect.

The project later improved this by adding `Landing.jsx`.

Current intended behavior:

- `/` → Landing
- no localStorage user → `/signin`
- localStorage user → `/chat`

### shadcn alias error

shadcn initially could not validate the import alias.

The alias was configured successfully.

### TypeScript `baseUrl` warning

The project is JavaScript, not TypeScript.

A `baseUrl` deprecation warning was encountered during setup.

Do not convert the project to TypeScript just because of this historical warning.

### CORS

Frontend/backend CORS issue was fixed.

### MongoDB

MongoDB connection and document creation were successfully tested.

---

## 28. Practical security limitations

This is a practice project, not production authentication.

Current limitations:

- localStorage can be manipulated by the client.
- ProtectedRoute is only a frontend guard.
- OTP is printed in terminal.
- No server-side authenticated session.
- No JWT.
- No rate limiting.
- No production-grade auth security.

These limitations are intentional.

Do not describe this implementation as production-ready.

If the user later wants production deployment/security, explain what must change.

---

## 29. Future features — not yet implemented

Only implement when requested:

- Logout
- Real SMS OTP service
- OTP resend
- Real-time chat
- WebSockets/Socket.IO
- Message persistence
- Online/offline status
- Typing indicator
- Read receipts
- Image/file messages
- Search
- Profile/settings
- Responsive/mobile chat UI
- Production authentication
- Deployment

Do not start these prematurely.

---

## 30. Logout — future

Logout has not yet been integrated into the final Chat UI.

Expected future behavior:

`Logout → remove user from localStorage → navigate to /signin`

Implement when the Chat UI includes the relevant logout control.

---

## 31. End-to-end user journeys

### New user

`/`
→ Landing
→ no localStorage user
→ `/signin`
→ `/signup`
→ enter name + phone
→ Create Account
→ MongoDB user created
→ `/signin`

### Existing logged-in user

`/`
→ Landing
→ user exists in localStorage
→ `/chat`

### Sign In

`/signin`
→ phone
→ Send OTP
→ backend checks account
→ generate OTP
→ store OTP
→ terminal displays OTP
→ enter 4-digit OTP
→ Verify
→ user returned
→ localStorage
→ `/chat`

### Direct Chat access

`/chat`
→ ProtectedRoute
→ no user → `/signin`
→ user exists → Chat

---

## 32. User's explicit project decisions

These decisions should remain in effect unless the user changes them:

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
14. Sign Up has no OTP.
15. Sign Up requires name + phone.
16. Sign In requires phone + 4-digit OTP.
17. OTP is currently printed in the backend terminal.
18. Successful login stores user in localStorage.
19. `/chat` is protected by ProtectedRoute.
20. `/` renders Landing and decides between `/signin` and `/chat`.
21. Build UI one screen at a time.
22. User writes/builds the code themselves.
23. Use shadcn where applicable.
24. Do not unnecessarily create custom components when shadcn already provides a suitable one.
25. Build UI from the outside inward.
26. Keep solutions simple unless the user explicitly requests a more advanced approach.

---

## 33. Handoff instructions for a new AI

You are taking over the TalkFlow project from another AI.

### First

Read this file completely.

### Second

Inspect the GitHub repository's current source code.

Do not assume historical code descriptions are identical to the current implementation.

### Third

Understand the current state:

- Frontend working.
- Backend working.
- MongoDB working.
- Sign Up working.
- Sign In working.
- Landing working.
- ProtectedRoute working.
- Authentication phase complete for current project scope.
- Actual Chat UI still needs to be built.

### Fourth

Do NOT:

- restart project creation
- reinstall already-working setup without a reason
- repeat completed authentication work
- convert to TypeScript
- add JWT
- add unnecessary security architecture
- add OTP to Sign Up

### Fifth

Continue with:

**Build the actual TalkFlow Chat UI from the user's provided design/reference images.**

Start from the outer layout and move inward.

Give the user one manageable step at a time and wait for them to say `done` before moving on.

---

## 34. Final current state

**Project:** TalkFlow

**Phase:** Authentication complete; Chat UI phase is next.

**Latest completed work:**

- ProtectedRoute completed.
- Landing.jsx created.
- `/` now checks localStorage.
- No user → `/signin`.
- Existing user → `/chat`.

**Next task:**
Start the actual Chat screen based on the provided design/reference images.

**Most important rule:**
Do not restart setup. Inspect the GitHub repository and continue from the current code.
