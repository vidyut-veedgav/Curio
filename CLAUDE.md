# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI-powered learning platform that enables users to create personalized learning sessions. Users provide a topic prompt, and the system generates structured learning modules with AI-assisted chat interactions for each module.

## Tech Stack

- **Frontend**: React 19.0.0, TypeScript 5, Tailwind 3.4.18, shadcn/ui, Next.js 16.0.4 (App Router)
- **Backend**: Next.js Server Actions, Prisma 6.19.0 (ORM), Socket.io 4.8.1 (WebSockets)
- **Database**: PostgreSQL (hosted on Neon)
- **Authentication**: NextAuth 5.0.0-beta.29
- **AI**: OpenAI 6.1.0 (gpt-4o-mini via LLMProvider abstraction)
- **State Management**: TanStack Query 5.90.8 (React Query)
- **Form Handling**: React Hook Form 7.65.0 with Zod 4.1.12 validation
- **Testing**: Vitest 4.0.1, @testing-library/react 16.3.0, jsdom 27.0.1

## Development Commands

```bash
# Start development server with Socket.io + Next.js
npm run dev              # Starts server.ts with WebSocket support

# Start Next.js only (no WebSocket)
npm run dev:next

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests with Vitest
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Database Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (database GUI)
npx prisma studio

# Push schema changes without creating migrations (development only)
npx prisma db push

# Clean database (delete all data)
npm run clean

# Seed database with test data
npm run seed
```

## Architecture

This full-stack application follows a three-layer architectural pattern:

1. **Server Actions** (`src/lib/actions/`): Next.js server actions containing business logic
2. **Custom Hooks**: React Query abstractions that wrap server actions
3. **Components**: UI components that consume hooks for data and mutations

### Database Schema Hierarchy

The application follows a hierarchical data model:

```
User
   LearningSession (1:many)
       name, description, originalPrompt
       Module (1:many)
           name, overview, content, order, isComplete
           messages: Json[]              # Stored as JSON array
           currentFollowUps: Json[]      # AI-generated follow-up questions
```

**Key Schema Details**:
- All IDs use UUID (`@db.Uuid`)
- PostgreSQL column names use snake_case (e.g., `user_id`, `learning_session_id`)
- Prisma models use camelCase with `@map()` directives
- Chat messages stored as JSON array in Module table (not separate table)
- NextAuth models: Account, Session, VerificationToken

### Server Actions Layer

The application is organized by feature with server actions in `src/lib/actions/`:

#### Session Actions (`sessionActions.ts`)
- `createLearningSession({ userId, topic, description?, length?, complexity? })` - Creates session with AI-generated modules
- `getLearningSessions(userId)` - Retrieves all user sessions
- `getLearningSessionById(sessionId)` - Retrieves single session with modules
- AI Integration: Uses LLMProvider with `gpt-4o-mini` to generate 3-5 modules
- Parameters:
  - `length`: short | medium | long (affects module count)
  - `complexity`: beginner | intermediate | advanced (affects content depth)

#### Module Actions (`moduleActions.ts`)
- `getModules(sessionId)` - Returns all modules for a session
- `getModuleById(moduleId)` - Returns module with session context
- `toggleModuleCompletion(moduleId)` - Toggles module completion status

#### Chat Actions (`chatActions.ts`)
- `getMessagesForModule(moduleId)` - Retrieves chat messages from Module.messages JSON
- `addMessageToModule({ moduleId, content, author })` - Appends message to JSON array
- Real-time AI responses handled via WebSocket (see `src/lib/websocket/handlers.ts`)

#### User Actions (`userActions.ts`)
- `getUser(userId)` - Fetches user profile
- `updateUserProfile(userId, data)` - Updates name, bio, or image

### AI Integration Layer

**LLMProvider Abstraction** (`src/lib/ai/LLMProvider.ts`):
- Abstract base class for LLM integrations
- Methods: `complete()` for single responses, `stream()` for streaming
- Currently implemented: `OpenAIProvider` (`src/lib/ai/providers/openai.ts`)

**Prompts** (`src/lib/prompts/`):
- Centralized prompt management via `getPrompt()` function
- Prompts organized by feature (session generation, content generation, chat responses, follow-up questions)

**WebSocket Handlers** (`src/lib/websocket/handlers.ts`):
- `handleAIChatGeneration()`: Streams AI responses in real-time via Socket.io
- Emits chunks as they arrive from OpenAI streaming API
- Automatically stores complete message and generates follow-up questions

### Project Structure

```
src/
   app/                            # Next.js App Router
       layout.tsx                  # Root layout
       page.tsx                    # Landing page
       providers.tsx               # React Query provider
       MarkdownRenderer.tsx        # Markdown/LaTeX renderer for module content

       api/auth/[...nextauth]/     # NextAuth endpoints

       home/                       # Home page (session list)
           page.tsx
           hooks.ts                # useGetSessions, useCreateSession
           components/
               SessionCard.tsx
               AddSessionButton.tsx

       session/[sessionId]/        # Session detail page (module list)
           page.tsx
           hooks.ts
           components/
               ModuleCard.tsx
               ModuleList.tsx
               SessionDescription.tsx
               SessionProgressBar.tsx

           module/[moduleId]/      # Module page (chat + content)
               page.tsx
               hooks.ts
               components/
                   Content.tsx
                   SessionHeader.tsx
                   ai_pane/
                       AIPane.tsx
                       AIPaneHeader.tsx
                       AIPaneInput.tsx
                       ChatMessage.tsx
                       FollowUpQuestions.tsx

   components/
       Header.tsx                  # Global header with auth dropdown
       ui/                         # shadcn/ui components

   lib/
       db.ts                       # Prisma client singleton
       auth.ts                     # NextAuth configuration
       api.ts                      # API utilities for client-side calls
       utils.ts                    # cn() for class merging

       actions/                    # Server actions
           sessionActions.ts
           moduleActions.ts
           chatActions.ts
           userActions.ts
           __tests__/              # Action tests

       ai/
           LLMProvider.ts          # Abstract LLM provider
           providers/openai.ts     # OpenAI implementation
           types.ts

       prompts/
           index.ts                # Centralized prompt templates

       websocket/
           handlers.ts             # Socket.io event handlers

   hooks/
       useGetUser.ts               # Get current user from NextAuth
       useSocket.ts                # Socket.io client hook

server.ts                          # Custom server with Socket.io
prisma/schema.prisma               # Database schema
scripts/                           # Database utilities (clean, seed, test)
```

**Path Aliases**: `@/*` maps to `./src/*` (configured in tsconfig.json)

### Hooks Pattern

Each page defines custom React Query hooks in a co-located `hooks.ts` file:
- Hooks wrap server actions with `useQuery` or `useMutation`
- Handle loading states, error handling, cache invalidation, and navigation
- Example: `src/app/home/hooks.ts` exports `useGetSessions()` and `useCreateSession()`

## WebSocket Events

The application uses Socket.io for real-time AI chat streaming:

**Server** (`server.ts`):
- Path: `/api/socket`
- CORS configured for development

**Client** (`src/hooks/useSocket.ts`):
- Automatically connects to Socket.io server
- Provides hook for emitting events and listening to responses

**Events**:
- `ai:chat:generate` - Client sends message to generate AI response
  - Payload: `{ moduleId: string, userMessage: string }`
- `ai:chat:chunk` - Server streams response chunks
  - Payload: `{ content: string }`
- `ai:chat:complete` - Server sends final message with follow-ups
  - Payload: `{ message: Message, followUpQuestions: string[] }`
- `ai:chat:error` - Server sends error
  - Payload: `{ error: string }`

## Testing Framework

### Setup
- **Test Runner**: Vitest 4.0.1
- **Test Utilities**: @testing-library/react 16.3.0, @testing-library/user-event 14.6.1
- **Environment**: jsdom 27.0.1 (simulates browser environment)
- **Config**: `vitest.config.ts` - Node environment, global test utilities, v8 coverage provider
- **Setup File**: `vitest.setup.ts` - Mocks environment variables (DATABASE_URL, OPENAI_API_KEY)

### Test Organization
All server action tests are located in `src/lib/actions/__tests__/`:
- `chatService.test.ts` - Chat message handling tests
- `sessionService.test.ts` - Session creation and AI generation tests
- `moduleService.test.ts` - Module management and completion tests
- `userService.test.ts` - User profile CRUD tests
- Database tests: `src/lib/__tests__/db.test.ts`

### Mocking Patterns
- **Prisma**: Mocked via `vi.mock('@/lib/db')` with `vi.mocked(prisma.model.method)`
- **OpenAI/LLMProvider**: Mock the provider classes in `src/lib/ai/`
- **Environment Variables**: Set in `vitest.setup.ts` to avoid missing .env in CI/CD

### Running Tests
```bash
npm test                 # Run all tests
npm run test:ui          # Run with Vitest UI
npm run test:coverage    # Run with coverage report
```

## AI Integration

**Model**: gpt-4o-mini (fast and cost-effective for educational content)

**LLMProvider Abstraction**:
- Abstract class in `src/lib/ai/LLMProvider.ts` defines interface
- `OpenAIProvider` implementation in `src/lib/ai/providers/openai.ts`
- Methods: `complete()` for single responses, `stream()` for real-time streaming

**Prompts**:
- Centralized in `src/lib/prompts/index.ts` via `getPrompt()` function
- Organized by feature: session generation, module content, chat responses, follow-up questions
- Each prompt includes system instructions and user context

**Streaming Flow**:
1. User sends message via WebSocket (`ai:chat:generate`)
2. Server handler calls `LLMProvider.stream()` with message history
3. Server emits chunks as they arrive (`ai:chat:chunk`)
4. Server stores complete message and generates follow-ups (`ai:chat:complete`)

**Module Content Rendering**:
- Markdown rendered with `react-markdown`
- LaTeX math support via `remark-math` and `rehype-katex`
- Code syntax highlighting via `react-syntax-highlighter`
- GFM (GitHub Flavored Markdown) support via `remark-gfm`

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://..."           # Neon PostgreSQL connection string
OPENAI_API_KEY="sk-..."                   # OpenAI API key
AUTH_SECRET="..."                         # NextAuth secret (generate with `openssl rand -base64 32`)
NEXTAUTH_URL="http://localhost:3000"      # Application URL
```

**Note**: `vitest.setup.ts` mocks these for testing to avoid requiring .env in CI/CD environments.

## Important Notes

### Authentication
- Uses NextAuth 5 (beta) with Google OAuth provider
- Session handling via database sessions (not JWT)
- Auth configuration in `src/lib/auth.ts`
- Protected routes check session via `auth()` from NextAuth

### Database
- All operations go through Prisma ORM
- Connection pooling enabled
- UUIDs for all primary keys
- JSON columns for messages and follow-up questions (not separate tables)

### Real-Time Features
- Socket.io runs on custom server (`server.ts`)
- WebSocket path: `/api/socket`
- Streaming AI responses for better UX
- Auto-generates follow-up questions after each AI response

### Development Server
- **IMPORTANT**: Use `npm run dev` (not `npm run dev:next`) to enable WebSocket support
- `npm run dev` starts `server.ts` which runs Next.js + Socket.io
- `npm run dev:next` starts only Next.js (WebSocket features won't work)

### TypeScript
- Strict mode enabled
- Path alias `@/*` for `./src/*`
- Server actions must have `'use server'` directive
- Client components must have `'use client'` directive

### UI Components
- shadcn/ui components in `src/components/ui/`
- Tailwind CSS 3.4.18 (not v4)
- `cn()` utility in `src/lib/utils.ts` for class merging
- Lucide React for icons

### Data Flow Pattern
1. User interacts with component
2. Component calls custom hook (React Query)
3. Hook calls server action
4. Server action performs business logic with Prisma
5. React Query handles caching, loading states, and revalidation
