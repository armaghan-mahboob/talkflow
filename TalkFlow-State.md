# TalkFlow — Current State

## Last Updated

2026-09-02

## Current Phase

Real-time messaging implementation — REST layer complete, building conversation-creation flow before Socket.IO.

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

### Data Models

- `Conversation` model created (`participants` array referencing `User`).
- `Message` model created (`conversation`, `sender` refs + `content` string, timestamps).

### REST APIs (tested via Postman)

- `POST /api/conversations` — creates a conversation between two participants; dedups via `$all`/`$size` so the same pair always returns the same conversation.
- `GET /api/conversations/:userId` — returns all conversations for a user, with participants populated (`name`, `email`).
- `POST /api/messages` — creates a message tied to a conversation + sender.
- `GET /api/messages/:conversationId` — returns all messages for a conversation, sorted oldest→newest.
- `GET /api/users/lookup?email=` — looks up a user by email, returns `{ id, name, email }` or 404.

### Chat UI

- Chat list screen implemented (still using hardcoded chat data, not yet wired to backend).
- Header and logout implemented.
- Search icon exists but is not functional.
- CHATS tab implemented; GROUPS/CALLS intentionally deferred.
- Floating compose button implemented:
  - Opens an inline overlay with an email input.
  - Submit handler looks up the entered email via `/api/users/lookup`, then creates/fetches a conversation via `POST /api/conversations`.
  - Validates empty input and self-chat (can't message own email).
  - On success, currently just logs the conversation to console and closes the overlay (no navigation yet — conversation screen doesn't exist).
- Conversation/chat screen not implemented yet.
- Visual theming deferred.

## Current Task

Build the conversation screen so `handleStartChat` can navigate to it instead of just logging the result.

## Next

1. Build conversation/chat screen (route + basic message list + input, using existing `/api/messages` REST routes for now).
2. Wire chat list (currently hardcoded) to `GET /api/conversations/:userId`.
3. Add Socket.IO for real-time send/receive, using the same Message model + save logic already built for REST.
4. Update message-send flow to go through sockets instead of (or alongside) REST.

## Scope

- 1-on-1 chat only.
- No group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.

## Notes / Decisions

- REST (conversations/messages) handles persistence + history load; Socket.IO (not yet built) will handle live delivery, reusing the same Mongoose models.
- Compose flow intentionally simple: type a friend's email, not a user-picker list.
