# Curio

An AI platform for personalized education.

## Tech Stack
**Frontend**: React 19.0.0, TypeScript 5, Tailwind 3.4.18, shadcn/ui, React Hook Form 7.65.0, TanStack Query 5.90.8

**Backend**: Next.js 15.5.6, Prisma 6.19.0 (ORM), PostgreSQL (DB)

**Cloud/APIs**: Vercel (app hosting), Neon (DB hosting), NextAuth 5.0.0-beta.29 (auth), OpenAI 6.1.0 (LLM)

**Testing**: Vitest 4.0.1, Testing Library 16.3.0, jsdom 27.0.1

## Architecture
This full-stack application follows a simple architectural pattern, split into three layers (backend to frontend):

- Server actions (/src/lib/actions): business logic that manipulates data
- Custom hooks: React Query abstractions that utilize the actions
- Components: inject custom hooks into React components