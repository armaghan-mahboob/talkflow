## `TalkFlow-State.md`

```md
# TalkFlow — Current State

## Last Updated

2026-09-02

## Current Phase

Real-time messaging implementation.

## Completed

### Setup

- React + Vite frontend working.
- Tailwind CSS v4 configured.
- shadcn/ui configured.
- Express backend working on port 5000.
- MongoDB connection working.
- CORS configured.

### Authentication

- Email + 4-digit OTP authentication implemented.
- Sign Up: name + email → OTP → Chat.
- Sign In: email → OTP → Chat.
- OTP sent through Gmail SMTP/Nodemailer.
- Resend OTP works.
- Authenticated user stored in localStorage as `{ id, email, name }`.
- `/chat` protected by `ProtectedRoute`.
- `/` redirects based on authentication state.

### Chat UI

- Chat list screen implemented.
- Header and logout implemented.
- Search icon exists but is not functional.
- CHATS implemented.
- GROUPS/CALLS intentionally deferred.
- Chat list currently uses hardcoded data.
- Floating compose button exists but is not functional.
- Conversation screen not implemented.
- Visual theming deferred.

## Current Task

Verify whether the `Conversation` model already exists in the repository.

- Inspect the repository first.
- If it exists and is correct → proceed to the `Message` model.
- If it does not exist → create the `Conversation` model.

## Next

1. Verify Conversation model.
2. Create/verify Message model.
3. Create conversation/message REST APIs.
4. Build conversation screen.
5. Connect chat list to backend.
6. Add Socket.IO.

## Scope

- 1-on-1 chat only.
- No group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.
```
