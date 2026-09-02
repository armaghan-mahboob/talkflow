# TalkFlow — Current State

## Last Updated

2026-09-03

## Current Phase

Real-time messaging implemented via Socket.IO. REST is now used only for initial data loading (conversation list, message history); sending/receiving messages is fully socket-based.

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

- `Conversation` model (`participants` array referencing `User`).
- `Message` model (`conversation`, `sender` refs + `content` string, timestamps).

### REST APIs (still in use)

- `POST /api/conversations` — creates a conversation between two participants; dedups via `$all`/`$size`.
- `GET /api/conversations/:userId` — returns all conversations for a user, participants populated (`name`, `email`).
- `GET /api/messages/:conversationId` — returns message history for a conversation, sorted oldest→newest. (Used for initial load only.)
- `GET /api/users/lookup?email=` — looks up a user by email, returns `{ id, name, email }` or 404.

### REST APIs (removed from use)

- `POST /api/messages` — no longer called by the frontend. Sending is fully replaced by the `send-message` socket event. Endpoint/controller still exists in the backend but is unused.

### Socket.IO — Real-time Messaging

- Backend: raw `http.Server` created from the Express `app`; Socket.IO attached to it (`server.js`).
- Backend: `io.on("connection")` handles:
  - `join-conversation` — joins the socket to a room named by `conversationId`.
  - `send-message` — persists the message via the `Message` model, then broadcasts `receive-message` to the room.
- Frontend: shared socket instance created in `src/lib/socket.js` (single connection, imported wherever needed).
- Frontend (`Conversation.jsx`):
  - Joins the conversation's room on mount/`conversationId` change.
  - Listens for `receive-message` and appends incoming messages to state (with cleanup via `socket.off`).
  - `handleSendMessage` emits `send-message` instead of using `fetch`.
- Verified working live between two separate logged-in sessions.

### Chat UI

- Chat list screen implemented.
- Header and logout implemented.
- Search icon exists but is not functional.
- CHATS tab implemented; GROUPS/CALLS intentionally deferred.
- Floating compose button implemented.
- Compose flow: email lookup → self-chat prevented → conversation created/fetched → navigate to conversation.
- Conversation/chat screen implemented, now with live send/receive.

### Conversation UI

- Displays the other participant's name/email in each chat item.
- Clicking an existing chat opens its corresponding `conversationId`.

## Current Task

Real-time messaging (Socket.IO) is functionally complete for 1-on-1 chat.

## Next

1. Show all users' avatars in chat screen header horizontally — active users unmuted, inactive muted.

## Scope

- 1-on-1 chat only.
- No group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.

## Notes / Decisions

- REST now handles only initial persistence/history load (conversations list, message history on open).
- Sending and receiving messages is fully socket-based — no REST call on send.
- Compose flow intentionally simple: type a friend's email, not a user-picker list.
