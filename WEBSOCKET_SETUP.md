# WebSocket Setup for Real-Time AI Chat

This project uses Socket.IO for real-time AI chat streaming.

## Architecture

- **Custom Server**: `server.ts` - Node.js HTTP server with Socket.IO integration (runs via tsx)
- **WebSocket Handler**: `src/lib/websocket/handlers.ts` - Handles AI chat generation with streaming
- **Client Hook**: `src/hooks/useSocket.ts` - React hook for Socket.IO client connection
- **Chat Hook**: `src/app/session/[sessionId]/module/[moduleId]/hooks.ts` - Module-specific AI chat hook

## Running the Development Server

The `npm run dev` command now runs the custom server instead of the default Next.js dev server:

```bash
npm run dev
```

This will:
1. Start the Next.js application
2. Initialize Socket.IO server on path `/api/socket`
3. Enable real-time WebSocket connections for AI chat

## How It Works

### Server-Side (server.ts)
1. Creates HTTP server with Next.js request handler
2. Attaches Socket.IO to the HTTP server
3. Listens for `ai:chat:generate` events
4. Streams AI responses back as `ai:chat:chunk` events
5. Emits `ai:chat:complete` when done

### Client-Side (React)
1. `useSocket()` - Establishes WebSocket connection
2. `useAIChat({ moduleId })` - Module-specific chat interface
3. User sends message via `sendMessage(content)`
4. Receives streaming chunks in real-time
5. Displays completed message when streaming finishes

## Events

### Client → Server
- `ai:chat:generate` - Send user message
  ```typescript
  { moduleId: string, message: string }
  ```

### Server → Client
- `ai:chat:chunk` - Streaming response chunk
  ```typescript
  { chunk: string }
  ```
- `ai:chat:complete` - Streaming complete
  ```typescript
  { message: string, moduleId: string }
  ```
- `ai:chat:error` - Error occurred
  ```typescript
  { error: string }
  ```

## Files Modified

1. **server.ts** - Custom server with Socket.IO (TypeScript)
2. **package.json** - Updated `dev` script to use custom server
3. **src/lib/websocket/handlers.ts** - WebSocket event handlers
4. **src/hooks/useSocket.ts** - Socket.IO client hook
5. **src/app/session/[sessionId]/module/[moduleId]/hooks.ts** - AI chat hook
6. **src/app/session/[sessionId]/module/[moduleId]/page.tsx** - Integrated real-time chat UI

## Why Custom Server?

Next.js App Router doesn't support WebSocket upgrades in API routes. Socket.IO requires access to the underlying HTTP server to handle WebSocket connections, which is only available through a custom server setup.

## Fallback to Standard Next.js

If you need to run without WebSockets:

```bash
npm run dev:next
```

This runs the standard Next.js dev server, but WebSocket features will not work.