# TalkFlow — Current State

## Last Updated

2026-09-02

## Current Phase

Real conversation frontend implemented — chat selection, conversation routing, message history, and message sending are working with the existing REST APIs.

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

- Chat list screen implemented .
- Header and logout implemented.
- Search icon exists but is not functional.
- CHATS tab implemented; GROUPS/CALLS intentionally deferred.
- Floating compose button implemented.
- Compose flow:
  - User enters another user's email.
  - User lookup is performed through the backend.
  - Self-chat is prevented.
  - Conversation is created/fetched through the backend.
  - User is navigated to the relevant conversation screen.
- Conversation/chat screen implemented.

### Conversation UI

- Replaced hardcoded chat list data.
- Displayed the other participant's name/email in each chat item.
- Clicking an existing chat now opens its corresponding `conversationId`.

## Current Task

1. Add Socket.IO for real-time message delivery.
2. Reuse the existing `Conversation` and `Message` models for Socket.IO persistence.
3. Update message sending/receiving to support live communication.

## Next

1. Show all users avatars in chat screen header horizontaly. Active users will be unmuted and inactve users will be muted

## Scope

- 1-on-1 chat only.
- No group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.

## Notes / Decisions

- REST (conversations/messages) handles persistence + history load; Socket.IO (not yet built) will handle live delivery, reusing the same Mongoose models.
- Compose flow intentionally simple: type a friend's email, not a user-picker list.
