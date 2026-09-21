# TalkFlow — Current State

## Last Updated

2026-09-21

## Current Phase

End-to-end message encryption implemented and verified. Messages are now encrypted client-side before transmission; server only ever handles ciphertext.

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
- Frontend caches the online user list in `src/lib/socket.js` (module-level, outside React state) so it survives component remounts. Components read the cached value via `getOnlineUsers()` on mount and subscribe to `online-users` for updates.
- Chat screen header shows a horizontal row of avatars for all conversation participants; online users get a green ring, offline users are dimmed (`opacity-70 grayscale`).

### End-to-End Encryption

- Library: `tweetnacl` + `tweetnacl-util` (`nacl.box` — X25519 + XSalsa20-Poly1305, authenticated public-key encryption).
- Crypto utilities in `src/lib/crypto.js`: `generateKeyPair`, `storeKeyPair`, `getStoredPrivateKey`, `getStoredPublicKey`, `hasKeyPair`, `encryptMessage`, `decryptMessage`.
- Key generation on **signup**: keypair generated client-side, private key stored in `localStorage` only, public key sent to server and stored on `User.publicKey`. Keys are stored only after OTP verification succeeds.
- Key regeneration on **sign-in**: if no local keypair exists (new device / cleared storage), a new keypair is generated and the public key is pushed to the server via `POST /api/auth/update-public-key`, overwriting the old one. Old messages encrypted under the previous key become permanently undecryptable — accepted tradeoff, matches real-world E2EE behavior (no server-side key escrow).
- `Message` schema extended with `ciphertext`, `nonce`, `encrypted` (default `true`). `content` kept for backward compatibility with pre-encryption messages; no longer required.
- `send-message` socket handler only accepts/stores `ciphertext`/`nonce` — server never receives or stores plaintext.
- Conversation participant queries (`conversationController.js`) populate `publicKey` alongside `name`/`email` so the frontend can encrypt/decrypt without extra requests.
- `Conversation.jsx`: encrypts before `socket.emit("send-message", ...)`; decrypts incoming messages (both live socket events and REST-loaded history) via a shared `decryptIncomingMessage` helper.
- Legacy plaintext messages (`encrypted: false` or missing) render as-is via `message.content`, no decryption attempted — verified working via manual test document.
- Decryption failure (tampered/invalid ciphertext, or missing keys) renders "🔒 Message could not be decrypted" instead of crashing — verified via manual ciphertext tampering test in MongoDB.
- **Verified:** encrypt-before-send, ciphertext-only over socket/DB, correct receiver decryption, tamper detection, backward compatibility with legacy plaintext — all confirmed working end-to-end.

## Current Task

End-to-end encryption milestone complete. No open sub-tasks on this feature.

## Next

Unread message badge count on the chat list (currently hardcoded to 0). Design decision still pending:

- Option A: session-based, tracked in React state only (resets on refresh).
- Option B: persisted in MongoDB (survives refresh/logout), requires schema change.
  Decision deferred — to be picked up next session.

## Scope

- 1-on-1 chat only, no group chat.
- Focus on functionality before visual polish.
- Do not restart completed work.
