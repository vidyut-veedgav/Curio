# Quick Start Guide: Testing Service Methods

This guide will help you quickly test your service layer methods and see their inputs/outputs.

## Step 1: Set Up Environment

Make sure you have these in your `.env` file:

```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
```

## Step 2: Generate Prisma Client

```bash
npx prisma generate
```

## Step 3: Seed the Database

```bash
npm run seed
```

**Output**: You'll see test users, sessions, modules, and messages created with their IDs.

## Step 4: Test Individual Services

Choose which service to test:

```bash
# Test user operations (CRUD)
npm run test:user

# Test session creation with AI (makes OpenAI API calls)
npm run test:session

# Test module management and completion
npm run test:module

# Test chat with AI responses (makes OpenAI API calls)
npm run test:chat
```

## Step 5: Run All Tests (Optional)

```bash
npm run test:all
```

This runs all service tests in sequence.

## What You'll See

Each test script will show:

1. **Input Parameters**: Exactly what data is being passed to the function
2. **Full JSON Output**: Complete response objects with all fields
3. **Execution Time**: How long API calls take (for AI features)
4. **Success/Error Messages**: Clear indication of what worked or failed

### Example Output

```
🧪 Testing User Service Methods

📌 Using sample user ID: abc-123-def-456

TEST 1: getUserData()
Input: { userId: 'abc-123-def-456' }

============================================================
🔹 Output - User Data Retrieved
============================================================
{
  "id": "abc-123-def-456",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@example.com",
  "bio": "Software engineer passionate about learning"
}

✅ User Service Tests Completed Successfully!
```

## Key Features

### User Service
- Get user profile
- Update name, bio
- Create new users
- Duplicate email prevention

### Session Service
- Create learning sessions with AI-generated modules
- Customize length (short/medium/long) and complexity (beginner/intermediate/advanced)
- See OpenAI's module generation in action
- List all sessions for a user

### Module Service
- Get all modules for a session
- Mark modules as complete
- Automatic session completion detection
- Get module details and titles

### Chat Service
- Send user messages and receive AI responses
- View conversation history with formatted output
- Test message limits (100 per module)
- See OpenAI context window in action

## Tips

1. **Start with `npm run seed`** to populate test data
2. **Test incrementally**: user → session → module → chat
3. **Watch API costs**: Session and chat tests make real OpenAI API calls
4. **Check the IDs**: Seed script prints all IDs you can use
5. **Edit the scripts**: Customize inputs in the test files to try different scenarios

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No users found" | Run `npm run seed` |
| "Module '@/lib/db' not found" | Run `npx prisma generate` |
| OpenAI API errors | Check `OPENAI_API_KEY` in `.env` |
| Database connection failed | Verify `DATABASE_URL` in `.env` |

## Next Steps

After testing:
1. Use these patterns in your API routes (`src/app/api/`)
2. Integrate into your frontend components
3. Add custom test cases by modifying the scripts
4. Build on the service layer with additional methods

## Files Created

```
scripts/
├── README.md                          # Detailed documentation
├── QUICKSTART.md                      # This file
├── seed.ts                            # Database seeding
├── test-all.ts                        # Run all tests
└── test-services/
    ├── test-user-service.ts           # User service tests
    ├── test-session-service.ts        # Session service tests
    ├── test-module-service.ts         # Module service tests
    └── test-chat-service.ts           # Chat service tests
```

## Available Commands

```bash
npm run seed         # Seed database with test data
npm run test:user    # Test user service
npm run test:session # Test session service (uses OpenAI)
npm run test:module  # Test module service
npm run test:chat    # Test chat service (uses OpenAI)
npm run test:all     # Run all service tests
```

---

**Ready to start?** Run `npm run seed` and then `npm run test:user`!
