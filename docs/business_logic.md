# Business Logic Documentation

**Project:** AI Learning Platform  
**Last Updated:** 2025-10-22  
**Authors:** Krishin Parikh, Vidyut Veedgav, August Matkov  

---

## Overview

This document defines the **business logic** and **domain behavior** of the AI Learning Platform — an application that enables users to create, manage, and complete personalized AI-assisted learning sessions.  

The system blends *freeform exploration* with *structured learning pathways*, generated dynamically by AI based on user prompts.

---

## Core Entities and Relationships

### **1. User**
Represents a registered learner.

| Attribute | Description |
|------------|-------------|
| `user_id` | Unique identifier |
| `first_name`, `last_name` | User name fields |
| `email` | Primary login credential |
| `bio` | Optional user description |

**Business Logic:**
- Each user must have a unique verified email.  
- A user can own multiple learning sessions.  
- Password resets require email verification.  
- Authentication is handled via Google OAuth or email/password via Supabase Auth.

---

### **2. Learning Session**
Defines a curated learning journey generated from a user’s prompt.

| Attribute | Description |
|------------|-------------|
| `learning_session_id` | Unique identifier |
| `user_id` | Foreign key (owner) |
| `name` | Session title |
| `description` | Short summary of topic |
| `original_prompt` | The user’s seed input that generates session modules |

**Business Logic:**
- When a user creates a new session:
  1. They provide a topic or description.
  2. The backend invokes OpenAI API to generate structured modules.
  3. Each generated module has objectives and lesson outlines.
- Session creation is blocked if AI fails to generate at least one valid module.
- Sessions are editable until the first module is completed.

---

### **3. Module**
Represents an AI-generated learning unit inside a session.

| Attribute | Description |
|------------|-------------|
| `module_id` | Unique identifier |
| `learning_session_id` | Foreign key |
| `name` | Module title |
| `overview` | AI-generated summary/objectives |
| `order` | Sequence position in session |
| `is_complete` | Completion flag |

**Business Logic:**
- An overview is provided at the top of each module with key ideas and objectives
- User is allowed to mark modules complete and move on to the next even if left halfway.
- AI-generated objectives must be displayed before chat begins.
- Module completion triggers an update to overall session progress (on `learning_session`).

---

### **4. Chat Message**
Represents AI-human interactions within a module.

| Attribute | Description |
|------------|-------------|
| `chat_message_id` | Unique identifier |
| `module_id` | Foreign key |
| `content` | Message text (AI or user) |
| `author` | `user` or `ai` |
| `order` | Message sequence number |

**Business Logic:**
- Chat messages persist chronologically by `order`.  
- AI responses are generated using the module’s objectives and context.  
- Messages are stored for session continuity and retrieval.  
- Message count per module is limited to prevent excessive API usage.

---

## 🧭 User Flow Logic

1. **Signup/Login**
   - Auth is managed via Auth.js.
   - Redirect to Dashboard upon success.

2. **Home**
   - Displays recent sessions, progress, and a “New Session” button.
   - Clicking a session opens its detail view.

3. **Create Learning Session**
   - User enters topic description, length, and complexity → click “Generate”.
   - System calls OpenAI API → creates modules and objectives.
   - New session is saved to DB under user account.

4. **Learning Session Interface**
   - Displays collapsible module list with progress.
   - Clicking a module shows objectives, lesson overview, and chat window.
   - Users interact via AI chat to learn content.

5. **Progress Update**
   - When a module is marked `is_complete = true`, update session’s % complete.
   - On completion of all modules → mark session as complete.

6. **Logout**
   - Clears session tokens and redirects to login.

---

## ⚙️ System Constraints and Performance Logic

- The system must:
  - Support 100+ concurrent users.
  - Keep all UI load times < 2 seconds.
  - Execute DB queries within 500 ms.
  - Maintain RESTful API communication across components.  

---

## 🚫 Out of Scope (Explicitly Excluded)

- Social features (friends/followers, activity feeds) are not implemented.  
- Multi-user collaboration within sessions is not supported.

---

## 🧩 Error and Safety Logic

| ID | Type | Description | Handling Logic |
|----|------|--------------|----------------|
| F-01 | Security | Prompt injection/jailbreak attempts | Sanitize user input; apply content filters before AI call |
| F-02 | Factuality | Unverified or wrong facts in AI output | Enable citation verification pipeline or manual review |
| F-03 | Safety | Age-inappropriate or sensitive content | Apply moderation API to all AI outputs |
| F-04 | Pedagogy | Weak learning objectives | Ensure measurable objectives via AI validation schema |
| F-05 | Personalization | Misaligned difficulty | Adjust based on stored learner profile metadata |
| F-07 | Formatting | LaTeX/Markdown render issues | Use unified markdown renderer and fallback display |
| F-09 | Factuality | Broken links or sources | Implement link validation on module save |

---

## 🧩 API-Level Business Logic Summary

| Action | Trigger | System Response |
|---------|----------|----------------|
| `POST /sessions` | User submits topic | AI generates session + modules |
| `GET /sessions/:id` | View session | Return session data and progress |
| `POST /modules/:id/complete` | Module finished | Update session progress |
| `POST /chat` | User sends message | Store, send to AI, return response |
| `GET /user/profile` | Dashboard load | Return user info, recent sessions |

---

## 🧠 AI Integration Logic

- **Prompt Composition:**  
  Concatenate user input + context from previous messages + objectives.

- **Response Filtering:**  
  Validate AI response against:
  - Safety rules (no NSFW or personal info)
  - Pedagogical structure (goal alignment)
  - Markdown syntax check

- **Storage:**  
  Persist final AI messages in `chat_message` with proper sequencing.

---

## 🏁 Completion Logic

A learning session is considered **complete** when:
- All `modules.is_complete == true`
- All required chats per module are finished
- Session summary generated by AI is stored in `learning_session.description`

---