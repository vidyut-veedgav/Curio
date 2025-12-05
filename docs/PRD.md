# Product Requirements Document: Curio

## Summary

Curio is an AI-powered learning platform that transforms user-provided topics into structured, personalized learning experiences. Users input a topic prompt, and the system generates a complete learning session with multiple modules, each featuring AI-assisted chat interactions. The platform adapts to user preferences for session length and complexity level, providing an interactive educational experience with real-time AI tutoring.

**Target Users**: Self-directed learners, students, professionals seeking skill development
**Core Technology**: Next.js 16, OpenAI GPT-4o-mini, PostgreSQL, Socket.io
**Key Differentiator**: Structured module generation with contextual AI chat assistance

## Problem

Traditional online learning suffers from three main issues:

1. **Lack of Personalization**: Generic courses don't adapt to individual learning needs or prior knowledge
2. **Poor Engagement**: Static content without interactive feedback leads to low completion rates
3. **Overwhelming Choice**: Learners struggle to structure their own learning path from a topic idea

Curio solves these problems by automatically generating a structured curriculum from a simple topic prompt, with built-in AI assistance that provides contextual, interactive support throughout the learning journey.

## User Stories

### Core User Flows

**As a learner, I want to:**
- Create a learning session by entering a topic and specifying my desired length and complexity level, so I can start learning immediately without course hunting
- View all my learning sessions in one place, so I can track my ongoing education
- Navigate through modules in sequence, so I have a clear learning path
- Chat with an AI tutor within each module, so I can ask questions specific to the current content
- Mark modules as complete, so I can track my progress through the session
- Receive AI-generated follow-up questions, so I can deepen my understanding of the material

**As a returning user, I want to:**
- Sign in with Google OAuth, so I can access my sessions across devices
- View my learning history and progress, so I can resume where I left off
- Update my profile information, so the AI can personalize responses

## In Scope

**Session Management**
- Create learning sessions with customizable parameters (topic, description, length: short/medium/long, complexity: beginner/intermediate/advanced)
- AI-generated module structure (3-5 modules based on length parameter)
- View all user sessions with progress tracking
- Delete sessions

**Module System**
- Sequential module progression
- Rich content with Markdown, LaTeX math, and code syntax highlighting
- Module completion tracking
- Progress visualization

**AI Chat Interaction**
- Real-time streaming AI responses via WebSocket
- Context-aware tutoring based on module content
- Auto-generated follow-up questions after each response
- Persistent chat history per module

**User Management**
- Google OAuth authentication via NextAuth
- User profiles with bio and image
- Session ownership and isolation