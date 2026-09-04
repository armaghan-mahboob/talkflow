# TalkFlow — Current State

## Last Updated

2026-09-05

## Current Phase

Presence tracking (online users) is implemented. Online contacts row added to Chat screen.

## Completed

### Authentication

- Email + 4-digit OTP authentication (Sign Up and Sign In flows).
- Gmail SMTP/Nodemailer used for OTP delivery, with Resend OTP.
- Authenticated user stored in localStorage.
- `/chat` protected via `ProtectedRoute`; `/` redirects based on auth state.

### Chat

- Chat list loads real conversations via REST.
- Compose flow: email lookup → conversation creation/fetch → conversation screen.
- Message history loads via REST; real-time send/receive via Socket.IO.
- Socket joins conversation rooms; logout disconnects the socket.

### Presence Tracking

- Socket connects with `auth: { userId }` set in `ProtectedRoute.jsx` before `socket.connect()`.
- Backend (`server.js`) maintains an in-memory `Map` (`userId -> socketId`) and broadcasts the full online user list (`online-users` event) on every connect/disconnect.
- Frontend caches the online user list in `src/lib/socket.js` (module-level, outside React state) so it survives component remounts (e.g. navigating back to Chat from a Conversation). Components read the cached value via `getOnlineUsers()` on mount and subscribe to `online-users` for updates.
- Chat screen header shows a horizontal row of avatars for all conversation participants; online users get a green ring, offline users are dimmed (`opacity-70 grayscale`).

## Current Task

Presence tracking + avatar row complete and verified (tested across two sessions, including navigation edge case).

## Next

Unread message badge count on the chat list (currently hardcoded to 0). Design decision pending:

- Option A: session-based, tracked in React state only (resets on refresh).
- Option B: persisted in MongoDB (survives refresh/logout), requires schema change.
  Decision deferred — to be picked up next session.

## Scope

- 1-on-1 chat only, no group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.
