# Chat YouApp

Monorepo microservices untuk aplikasi chat (backend) berbasis TypeScript. Repo ini berisi beberapa service utama (auth, user, chat, gateway) dan package bersama.

## Struktur

- `services/auth-service` - autentikasi dan token, memakai MySQL.
- `services/user-service` - manajemen user, memakai Postgres.
- `services/chat-service` - percakapan dan pesan, memakai MongoDB + Redis.
- `services/gateway-service` - API gateway untuk mengarahkan request.
- `packages/common` - utilitas, types, dan helpers bersama.

## Teknologi

- Node.js + TypeScript
- PNPM workspace
- Express
- RabbitMQ (event/messaging)
- MySQL, Postgres, MongoDB, Redis

## Prasyarat

- Node.js
- PNPM
- Docker + Docker Compose

## Menjalankan Infrastruktur Pendukung

```bash
# dari root repo
pnpm install

# jalankan database dan broker
# gunakan docker compose di root
# (port default bisa diubah via env)
docker compose up -d
```

## Menjalankan Service

```bash
# dev mode untuk semua service
pnpm dev
```

Jika ingin menjalankan service tertentu:

```bash
pnpm --filter @chat-youapp/auth-service dev
pnpm --filter @chat-youapp/user-service dev
pnpm --filter @chat-youapp/chat-service dev
pnpm --filter @chat-youapp/gateway-service dev
```

## Script Umum

- `pnpm dev` - jalankan semua service dalam mode watch.
- `pnpm build` - build semua service.
- `pnpm lint` - lint seluruh service.
- `pnpm format` - cek format.
- `pnpm test` - jalankan test (sebagian service masih placeholder).

## Socket.IO (Chat Service)

Realtime chat tersedia di `@chat-youapp/chat-service` pada port `CHAT_SERVICE_PORT`.

### Autentikasi Socket

Saat konek ke Socket.IO, kirim konteks user dengan salah satu cara berikut:

- `auth.userId` (disarankan)
- header `x-user-id`

Contoh client:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    userId: 'USER_UUID',
  },
});
```

### Event Client -> Server

- `join_conversation` payload: `{ conversationId: string }`
- `leave_conversation` payload: `{ conversationId: string }`
- `send_message` payload: `{ conversationId: string, body: string }`

### Event Server -> Client

- `message_created` payload: object message yang baru dibuat
- `socket_error` payload: `{ message: string }`

### Alur Realtime Singkat

1. Client connect dengan `userId` valid.
2. Client emit `join_conversation` untuk room tertentu.
3. Client emit `send_message`.
4. Server simpan message ke MongoDB lalu broadcast `message_created` ke room conversation tersebut.

## Catatan

- Pastikan database dan RabbitMQ sudah berjalan sebelum menjalankan service.
- Detail endpoint dan skema request berada di folder `routes/` dan `validation/` masing-masing service.
- Postman link : https://codewithhappier-9734063.postman.co/workspace/Personal-Team's-Workspace~0ec18403-d4f8-4a70-8ba2-e827eac55977/collection/49382522-7e6f555b-99fe-48fc-a1bb-2158f2bd1a2c?action=share&creator=49382522&active-environment=49382522-2b5ad247-1728-4c22-940c-4efe8b9af257
