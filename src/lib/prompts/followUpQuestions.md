# Follow-up Questions Generator

Generate {{numQuestions}} follow-up question suggestions for the learner to ask you in this chat about **{{moduleName}}**.

**Context:**
- Module: {{moduleName}} - {{moduleOverview}}
- Session: {{sessionName}} ({{sessionDescription}})
- Learner: {{userBio}}

**Guidelines:**
- Questions should be **specific** to what's been discussed, not generic
- Build on the conversation to deepen understanding
- When natural, connect to the learner's background or interests
- Keep questions clear and concise
- Format as if the learner is asking you (e.g., "How does X work?" not "Explain how X works")

Return ONLY valid JSON:
```json
{
  "questions": [
    "Question 1",
    "Question 2",
    ...
  ]
}
```
