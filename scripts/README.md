# Service Testing Scripts

This directory contains scripts for testing and interacting with the service layer methods. These scripts allow you to see the inputs and outputs of each service method with real database data.

## Prerequisites

1. **Database Connection**: Ensure your `.env` file has a valid `DATABASE_URL` for your PostgreSQL database
2. **OpenAI API Key**: Add `OPENAI_API_KEY` to your `.env` file for AI-powered features
3. **Prisma Setup**: Run `npx prisma generate` to generate the Prisma client

## Quick Start

### 1. Clean the Database (Optional)

If you want to start with a completely empty database:

```bash
npm run clean
```

This will:
- Ask for confirmation before proceeding
- Delete all chat messages, modules, sessions, and users
- Show counts before and after deletion
- Keep the database schema intact

**WARNING**: This permanently deletes all data!

### 2. Seed the Database

Populate your database with test data:

```bash
npm run seed
```

This will:
- Create 2 test users
- Create 3 learning sessions with modules
- Add sample chat messages
- Display all created IDs for reference

**Note**: The seed script will delete existing data first. Comment out the cleanup section if you want to keep existing data.

### 3. Test Individual Services

Run any of these commands to test specific service methods:

```bash
# Test user service (getUserData, setUserData, createUser)
npm run test:user

# Test session service (createSession, getSessions, getSessionById)
npm run test:session

# Test module service (getModules, getModuleById, markModuleComplete, getModuleTitle)
npm run test:module

# Test chat service (getMessages, sendMessage with AI responses)
npm run test:chat
```

## What Each Script Tests

### User Service (`test-user-service.ts`)
- ✅ Retrieve user data by ID
- ✅ Update user profile (bio, name)
- ✅ Create new user with validation
- ✅ Duplicate email prevention
- ✅ Error handling for non-existent users

### Session Service (`test-session-service.ts`)
- ✅ Get all sessions for a user
- ✅ Get specific session by ID
- ✅ Create session with AI-generated modules (short/medium/long)
- ✅ Different complexity levels (beginner/intermediate/advanced)
- ✅ OpenAI API integration and fallback
- ✅ Error handling for invalid users

### Module Service (`test-module-service.ts`)
- ✅ Get all modules for a session
- ✅ Get specific module details
- ✅ Get module title
- ✅ Mark module as complete
- ✅ Session completion detection
- ✅ Error handling for non-existent modules

### Chat Service (`test-chat-service.ts`)
- ✅ Retrieve all chat messages
- ✅ Send user message and receive AI response
- ✅ View conversation history
- ✅ Test message limit enforcement (100 messages per module)
- ✅ Direct AI message sending
- ✅ OpenAI API integration with context

## Output Format

All scripts output:
- **Input parameters** in a clear format
- **Full JSON objects** with pretty printing
- **Execution timing** for API calls
- **Success/error status** for each test
- **Conversation views** for chat messages (formatted with icons)

## Example Output

```
🧪 Testing User Service Methods

📌 Using sample user ID: 123e4567-e89b-12d3-a456-426614174000

TEST 1: getUserData()
Input: { userId: '123e4567-e89b-12d3-a456-426614174000' }

============================================================
🔹 Output - User Data Retrieved
============================================================
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@example.com",
  "bio": "Software engineer passionate about learning"
}
```

## Tips

1. **Run seed first**: Always run `npm run seed` before testing if you don't have data
2. **Check .env**: Make sure your environment variables are set up correctly
3. **Watch API usage**: The session and chat tests will make real OpenAI API calls
4. **Test incrementally**: Test services in order: user → session → module → chat
5. **Check the output**: All test IDs are printed by the seed script for reference

## Troubleshooting

### "No users/sessions found" Error
- Run `npm run seed` to populate the database

### "User not found" or "Module not found"
- Check that the seed script completed successfully
- Verify your database connection in `.env`

### OpenAI API Errors
- Verify your `OPENAI_API_KEY` in `.env`
- Check your OpenAI account has available credits
- The scripts include fallback logic for AI generation failures

### TypeScript/Import Errors
- Run `npx prisma generate` to regenerate the Prisma client
- Ensure `tsx` is installed: `npm install --save-dev tsx`
- Check that your `tsconfig.json` includes the `@/*` path alias

## Customization

Feel free to modify the test scripts to:
- Change input parameters
- Add new test cases
- Adjust output formatting
- Test with your own data

Each script is standalone and can be edited independently.

## Next Steps

After testing the service layer, you can:
1. Use these patterns to build API routes
2. Integrate services into your frontend components
3. Add additional business logic methods
4. Create integration tests based on these scripts
